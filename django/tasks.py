import logging
import requests
import os
from celery import shared_task
from django.core.mail import EmailMessage
from django.utils import timezone
from django.conf import settings
from django.core.files.base import ContentFile
from .models import ExamDelivery

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=180)
def process_exam_delivery_dispatch(self, delivery_id: int):
    """
    Celery background task to process the multi-channel dispatch of custom watermarked CAPS/IEB exam prediction booklets.
    Sends an SMTP email with the PDF booklet attached, and initiates WhatsApp Cloud API delivery.
    """
    logger.info(f"Initiating Celery background dispatch for ExamDelivery #{delivery_id}")
    
    try:
        # Retrieve the target ExamDelivery instance
        delivery = ExamDelivery.objects.select_related('student', 'exam_prediction').get(pk=delivery_id)
    except ExamDelivery.DoesNotExist:
        logger.error(f"ExamDelivery with ID #{delivery_id} does not exist. Aborting task.")
        return False

    # Update delivery statuses to processing
    delivery.email_status = 'pending'
    delivery.whatsapp_status = 'pending'
    delivery.save()

    # Track overall channel success flags
    email_success = False
    whatsapp_success = False

    # -------------------------------------------------------------
    # CHANNEL 1: SECURE SMTP EMAIL VIA AWS SES / SYSTEM SMTP
    # -------------------------------------------------------------
    try:
        # Fetch watermarked PDF from secure S3/HMAC single-session URL
        logger.info(f"Downloading watermarked exam booklet PDF from target vault: {delivery.pdf_url}")
        pdf_response = requests.get(delivery.pdf_url, timeout=30)
        
        if pdf_response.status_code == 200:
            student_name = delivery.student.get_full_name() or delivery.student.username
            curriculum = delivery.exam_prediction.curriculum
            paper_type = delivery.exam_prediction.paper_type.upper()
            target_year = delivery.exam_prediction.target_year
            
            # Construct beautiful email notification
            email_subject = f"AMARIS Math Hub - Your Custom Predicted {curriculum} {paper_type} Booklet ({target_year})"
            email_body = (
                f"Dear {student_name},\n\n"
                f"Your high-value custom predicted {curriculum} Grade 12 Mathematics {paper_type} "
                f"booklet for the upcoming {target_year} trials/exams has been successfully compiled and watermarked.\n\n"
                f"Please find your secure S3-vault booklet attached to this email. You can also view active logs "
                f"and solutions via your Student Dashboard.\n\n"
                f"Your access token and dynamic anti-share watermarks are active and tied to your profile registration.\n\n"
                f"Best of luck with your study preparation!\n\n"
                f"Warm Regards,\n"
                f"Tutor Bethuel Thipe\n"
                f"Amaris Mathematics Hub (AMH) CAPS & IEB Team"
            )
            
            # Use Django SMTP/EmailMessage to compose email with attachment
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', os.getenv('SMTP_USER', 'no-reply@amarismathematics.co.za'))
            to_email = delivery.student.email
            
            email = EmailMessage(
                subject=email_subject,
                body=email_body,
                from_email=from_email,
                to=[to_email]
            )
            
            # Dynamic filename construction
            filename = f"AMARIS_{curriculum}_{paper_type}_{target_year}_Predicted_Booklet.pdf"
            email.attach(filename, pdf_response.content, "application/pdf")
            
            # Send via SMTP configured in environment
            email.send(fail_silently=False)
            
            delivery.email_status = 'sent'
            email_success = True
            logger.info(f"Successfully dispatched secure SMTP notification to {to_email}")
        else:
            logger.error(f"Failed to fetch watermarked PDF from {delivery.pdf_url}. Status Code: {pdf_response.status_code}")
            delivery.email_status = 'failed'
            
    except Exception as e:
        logger.exception(f"SMTP execution failure for delivery ref #{delivery_id}: {str(e)}")
        delivery.email_status = 'failed'

    # -------------------------------------------------------------
    # CHANNEL 2: WHATSAPP BUSINESS CLOUD API INTEGRATION
    # -------------------------------------------------------------
    try:
        # Retrieve target WhatsApp number from student profiles
        whatsapp_number = getattr(delivery.student, 'whatsapp_number', None) or getattr(delivery.student, 'phone', '')
        
        if whatsapp_number:
            logger.info(f"Initiating WhatsApp Cloud template message dispatch to: {whatsapp_number}")
            
            # --- META WHATSAPP BUSINESS API INTEGRATION BLUEPRINT ---
            # Required env configurations:
            # - WHATSAPP_ACCESS_TOKEN (Permanent System User Token from Meta Business Manager)
            # - WHATSAPP_PHONE_NUMBER_ID (Sender Business Phone ID)
            # - WHATSAPP_TEMPLATE_NAME (Approved template with parameters)
            
            whatsapp_token = os.getenv('WHATSAPP_ACCESS_TOKEN')
            phone_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID')
            template_name = os.getenv('WHATSAPP_TEMPLATE_NAME', 'amaris_predicted_dispatch')
            
            if whatsapp_token and phone_number_id:
                # Prepare Meta WhatsApp Cloud API endpoint
                api_url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
                headers = {
                    "Authorization": f"Bearer {whatsapp_token}",
                    "Content-Type": "application/json"
                }
                
                # Payload matching Meta template variable mappings
                # Variable 1: Student Name
                # Variable 2: Paper Details (e.g. CAPS Paper 1)
                # Variable 3: Link to watermarked download
                payload = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": whatsapp_number,
                    "type": "template",
                    "template": {
                        "name": template_name,
                        "language": {
                            "code": "en_US"
                        },
                        "components": [
                            {
                                "type": "body",
                                "parameters": [
                                    {"type": "text", "text": delivery.student.first_name or delivery.student.username},
                                    {"type": "text", "text": f"{delivery.exam_prediction.curriculum} Grade 12 Math {delivery.exam_prediction.paper_type.upper()}"},
                                    {"type": "text", "text": delivery.pdf_url}
                                ]
                            }
                        ]
                    }
                }
                
                response = requests.post(api_url, json=payload, headers=headers, timeout=15)
                
                if response.status_code in [200, 201]:
                    logger.info(f"Meta WhatsApp Cloud API accepted request. ID: {response.json().get('messages', [{}])[0].get('id')}")
                    delivery.whatsapp_status = 'sent'
                    whatsapp_success = True
                else:
                    logger.error(f"WhatsApp API failed with code {response.status_code}. Response: {response.text}")
                    delivery.whatsapp_status = 'failed'
            else:
                # Local Simulation/Sandbox fallback mode if credentials aren't deployed
                logger.warning("WhatsApp API configurations are missing in environment. Engaging Simulated Sandbox delivery.")
                delivery.whatsapp_status = 'simulated'
                whatsapp_success = True
        else:
            logger.warning(f"Student #{delivery.student.pk} does not have a registered phone/whatsapp number. WhatsApp skipped.")
            delivery.whatsapp_status = 'failed'
            
    except Exception as e:
        logger.exception(f"WhatsApp Cloud dispatch failure for delivery ref #{delivery_id}: {str(e)}")
        delivery.whatsapp_status = 'failed'

    # Save transaction state changes
    delivery.save()

    # -------------------------------------------------------------
    # RETRY LOGIC & WORKFLOW ORCHESTRATION
    # -------------------------------------------------------------
    # If either of the active delivery channels failed, we trigger a Celery task retry
    if not (email_success and whatsapp_success):
        delivery.retry_count += 1
        delivery.save()
        
        logger.warning(
            f"ExamDelivery #{delivery_id} has incomplete channels. "
            f"Email Status: {delivery.email_status}, WhatsApp Status: {delivery.whatsapp_status}. "
            f"Triggering Celery backoff retry {self.request.retries + 1}/3..."
        )
        
        # Increment and propagate celery built-in retry
        try:
            self.retry()
        except self.MaxRetriesExceededError:
            logger.error(f"Max delivery retries exceeded for ExamDelivery #{delivery_id}. Notification logged as failed.")
            delivery.email_status = 'failed'
            delivery.whatsapp_status = 'failed'
            delivery.save()
            return False
    else:
        # Finalize and mark delivery timestamps successfully
        delivery.mark_completed()
        logger.info(f"ExamDelivery #{delivery_id} successfully dispatched and marked completed across both secure channels.")
        return True
