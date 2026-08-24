import React, { useState, useEffect, useRef } from "react";
import { 
  Image, Video, Search, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  X, Upload, Sparkles, Trash2, Tag, Folder, HelpCircle, FileText, Camera, RefreshCw,
  Undo, Type, Eraser, Brush, Check, Plus, MessageSquare, Maximize2, Minimize2, Download, RotateCcw,
  GripVertical, Play, Pause, Crop, RotateCw, Sliders, Move, Star, Printer, LayoutGrid, FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { dbAuth, isSuperAdmin } from "../lib/db";
import { Profile } from "../types";

interface GalleryItem {
  id: string;
  title: string;
  category: "Classroom" | "Classroom & HQ" | "Events" | "Events & Success" | "Success Stories" | "Worksheets" | "Worksheets & Scans" | "Digital Whiteboards" | "Study Materials" | string;
  description: string;
  type: "image" | "video";
  url: string;
  isUserUploaded?: boolean;
  uploadedAt?: string;
  tags?: string[];
  caption?: string;
  altText?: string;
  isFavorite?: boolean;
}

const CATEGORIES = ["All", "Classroom", "Events", "Worksheets", "Digital Whiteboards", "Study Materials"];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "amh-tutor-online",
    title: "1-on-1 Interactive Online Class",
    category: "Classroom",
    description: "Head Instructor Bethuel Moukangwe delivering a high-impact, live interactive 1-on-1 Grade 12 CAPS calculus lesson with whiteboard tools.",
    type: "image",
    url: "/src/assets/images/tutor_teaching_online_1783863452429.jpg",
    uploadedAt: "2026-07-10 14:30 (SAST)",
    tags: ["Calculus", "Grade 12", "1-on-1", "Classroom"],
    altText: "Head Instructor Bethuel Moukangwe teaching Grade 12 CAPS calculus live on interactive virtual whiteboard",
    caption: "Live interactive 1-on-1 tutoring session demonstrating step-by-step differentiation and first principles."
  },
  {
    id: "amh-hq-seminar",
    title: "Pretoria HQ Mathematics Seminar",
    category: "Classroom",
    description: "Interactive Grade 11 & 12 CAPS exam review workshop hosted at the Pretoria Amaris learning suite.",
    type: "image",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
    uploadedAt: "2026-07-12 11:00 (SAST)",
    tags: ["HQ", "Seminar", "Grade 11", "Classroom"],
    altText: "South African high school students attending a mathematics exam review seminar in a modern classroom suite",
    caption: "Collaborative CAPS exam review workshop hosted at the Pretoria Amaris learning suite."
  },
  {
    id: "amh-grad-celebration",
    title: "UNISA Academic Graduation Celebration",
    category: "Events",
    description: "Celebrating student milestones and university admissions, inspiring South African learners to reach distinction level scores (Level 7).",
    type: "image",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    uploadedAt: "2026-06-18 10:15 (SAST)",
    tags: ["Graduation", "Alumni", "Distinction", "Events"],
    altText: "Graduating mathematics students wearing academic caps and gowns celebrating top Level 7 distinctions",
    caption: "Honoring South African matriculants and university admission milestone achievements."
  },
  {
    id: "amh-top-achievers",
    title: "Annual CAPS High-Achievers Award Ceremony",
    category: "Events",
    description: "Recognizing outstanding mathematics improvements and distinction certificates for matric upgrade students.",
    type: "image",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
    uploadedAt: "2026-06-25 18:30 (SAST)",
    tags: ["Awards", "Matric 2025", "Top Achievers", "Events"],
    altText: "Annual mathematics distinction awards ceremony recognizing top performing high school learners",
    caption: "Celebrating students who scored distinction certificates (Level 7 - 80%+) in Grade 12 NSC exam trials."
  },
  {
    id: "amh-worksheet-nsc",
    title: "NSC Trial Examination Practice Worksheet",
    category: "Worksheets",
    description: "Structured CAPS Paper 1 algebra and sequence problem set with step-by-step model memo solutions.",
    type: "image",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    uploadedAt: "2026-07-08 08:30 (SAST)",
    tags: ["Worksheet", "NSC Exam", "Algebra", "Worksheets"],
    altText: "Mathematics examination worksheet with quadratic sequences and algebraic equations problem set",
    caption: "Structured CAPS Paper 1 practice worksheet covering geometric series and quadratic sequence formulas."
  },
  {
    id: "amh-worksheet-calculus",
    title: "Calculus Limits & Derivatives Practice Sheet",
    category: "Worksheets",
    description: "Comprehensive worksheet featuring first principles derivatives, cubic polynomial tangents, and optimization problems.",
    type: "image",
    url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=800&auto=format&fit=crop",
    uploadedAt: "2026-07-15 13:20 (SAST)",
    tags: ["Worksheet", "Calculus", "Grade 12", "Worksheets"],
    altText: "Printed mathematics calculus worksheet displaying derivative limit formulas and cubic graphs",
    caption: "Grade 12 calculus worksheet focusing on finding f'(x) using first principles and tangent line slopes."
  },
  {
    id: "amh-trig-whiteboard",
    title: "Digital Whiteboard Solutions: Trigonometry",
    category: "Digital Whiteboards",
    description: "Systematic step-by-step resolution of double-angle trigonometric identities and proofs logged on our interactive portal.",
    type: "image",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    uploadedAt: "2026-07-14 16:00 (SAST)",
    tags: ["Trigonometry", "Identities", "Whiteboard"],
    altText: "Digital whiteboard canvas showing double angle trigonometry proofs sin(2A) and cos(2A) equations",
    caption: "Step-by-step digital whiteboard proof simplifying compound and double angle trigonometric expressions."
  },
  {
    id: "amh-whiteboard-geometry",
    title: "Analytical Geometry Circles & Tangents Diagram",
    category: "Digital Whiteboards",
    description: "Interactive vector whiteboard breakdown of circle equation proofs, perpendicular bisectors, and tangents.",
    type: "image",
    url: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=800&auto=format&fit=crop",
    uploadedAt: "2026-07-19 15:10 (SAST)",
    tags: ["Geometry", "Circles", "Whiteboard"],
    altText: "Analytical geometry circle diagram on digital whiteboard showing center radius and tangent line equations",
    caption: "Vector whiteboard proof determining circle center (h,k), radius r, and tangent line gradient."
  },
  {
    id: "amh-math-study",
    title: "Grade 12 CAPS Mathematics Reference Guide",
    category: "Study Materials",
    description: "Learners working through past IEB and NSC examination papers with physical math workbooks and scientific calculators.",
    type: "image",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
    uploadedAt: "2026-07-05 09:45 (SAST)",
    tags: ["Exam Prep", "Algebra", "Study Group", "Study Materials"],
    altText: "Mathematics student desk with open textbook, notebook equations, and scientific calculator",
    caption: "Comprehensive CAPS & IEB Mathematics examination preparation guide and study workbook."
  }
];

export const Gallery: React.FC<{ user?: Profile | null }> = ({ user: propUser }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(propUser || null);

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    } else {
      setCurrentUser(dbAuth.getCurrentUser());
    }
  }, [propUser]);

  const isSuperAdminUser = isSuperAdmin(currentUser);
  const canManageGallery = isSuperAdminUser;
  const isAdmin = isSuperAdminUser;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFilmstrip, setShowFilmstrip] = useState<boolean>(true);
  
  // Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Tag Filter State
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Annotation States
  const [annotations, setAnnotations] = useState<Record<string, { drawings?: string; textNotes?: { id: string; text: string; x: number; y: number }[] }>>({});
  const [annotationMode, setAnnotationMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>("#ef4444");
  const [brushSize, setBrushSize] = useState<number>(4);
  const [drawingTool, setDrawingTool] = useState<"draw" | "eraser" | "text">("draw");
  const [localTextNotes, setLocalTextNotes] = useState<{ id: string; text: string; x: number; y: number }[]>([]);
  const [tempNoteCoords, setTempNoteCoords] = useState<{ x: number; y: number } | null>(null);
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [imageResolution, setImageResolution] = useState<{ width: number; height: number }>({ width: 1200, height: 900 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);

  // Preset math subjects / topics
  const PRESET_TAGS = [
    "Algebra", "Calculus", "Trigonometry", "Geometry", "Statistics", "Probability", "Functions", "Financial Maths"
  ];
  
  // Custom Upload Form States
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadDesc, setUploadDesc] = useState<string>("");
  const [uploadAltText, setUploadAltText] = useState<string>("");
  const [uploadCaption, setUploadCaption] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<GalleryItem["category"]>("Classroom");
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [uploadFileBase64, setUploadFileBase64] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSelectedTags, setUploadSelectedTags] = useState<string[]>([]);
  const [uploadCustomTags, setUploadCustomTags] = useState<string[]>([]);
  const [newUploadCustomTag, setNewUploadCustomTag] = useState<string>("");

  // Batch Upload States (Allows 100+ photos)
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string>("");
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  // Custom Camera States
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [cameraTitle, setCameraTitle] = useState<string>("");
  const [cameraDesc, setCameraDesc] = useState<string>("");
  const [cameraAltText, setCameraAltText] = useState<string>("");
  const [cameraCaption, setCameraCaption] = useState<string>("");
  const [cameraCategory, setCameraCategory] = useState<GalleryItem["category"]>("Classroom");
  const [cameraSelectedTags, setCameraSelectedTags] = useState<string[]>([]);
  const [cameraCustomTags, setCameraCustomTags] = useState<string[]>([]);
  const [newCameraCustomTag, setNewCameraCustomTag] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Editable Caption, Alt Text & Tags States (for Lightbox & Quick Edit)
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingTagsModalId, setEditingTagsModalId] = useState<string | null>(null);
  const [editAltTextValue, setEditAltTextValue] = useState<string>("");
  const [editCaptionValue, setEditCaptionValue] = useState<string>("");
  const [editCategoryValue, setEditCategoryValue] = useState<string>("Classroom");
  const [editTagsValue, setEditTagsValue] = useState<string[]>([]);
  const [newEditTagInput, setNewEditTagInput] = useState<string>("");
  const [captionSaveSuccess, setCaptionSaveSuccess] = useState<string>("");

  // Delete Confirmation & Undo States
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: "single" | "lightbox" | "bulk" | "restore";
    targetId?: string;
    targetTitle?: string;
    targetIds?: string[];
  }>({ isOpen: false, type: "single" });
  const [recentlyDeletedItems, setRecentlyDeletedItems] = useState<{
    items: GalleryItem[];
    ids: string[];
  } | null>(null);

  // Drag & Drop Reorder States
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Auto-play Slideshow States
  const [isSlideshowActive, setIsSlideshowActive] = useState<boolean>(false);
  const [slideshowCategory, setSlideshowCategory] = useState<string>("All");
  const [slideshowIntervalMs, setSlideshowIntervalMs] = useState<number>(4000);
  const [slideshowIsPlaying, setSlideshowIsPlaying] = useState<boolean>(true);
  const [slideshowIndex, setSlideshowIndex] = useState<number>(0);

  // Image Cropper States
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [cropTargetType, setCropTargetType] = useState<"upload" | "camera" | "existing">("upload");
  const [cropTargetId, setCropTargetId] = useState<string | undefined>(undefined);
  const [cropAspectRatio, setCropAspectRatio] = useState<"1:1" | "4:3" | "16:9" | "3:2" | "free">("4:3");
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropRotation, setCropRotation] = useState<number>(0);
  const [cropOffsetX, setCropOffsetX] = useState<number>(0);
  const [cropOffsetY, setCropOffsetY] = useState<number>(0);

  // Print Gallery Mode States
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printPaperSize, setPrintPaperSize] = useState<"A4" | "Letter">("A4");
  const [printGridCols, setPrintGridCols] = useState<1 | 2 | 3 | 4>(2);
  const [printShowTitles, setPrintShowTitles] = useState<boolean>(true);
  const [printShowCaptions, setPrintShowCaptions] = useState<boolean>(true);
  const [printShowTags, setPrintShowTags] = useState<boolean>(true);
  const [printShowHeader, setPrintShowHeader] = useState<boolean>(true);
  const [printShowDates, setPrintShowDates] = useState<boolean>(true);
  const [printSheetTitle, setPrintSheetTitle] = useState<string>("Amaris Mathematics Hub — CAPS & IEB Mathematics Visual Study Sheet");
  const [printItemIds, setPrintItemIds] = useState<string[]>([]);

  // Load from local storage + merge defaults and student uploads
  useEffect(() => {
    let customItems: GalleryItem[] = [];
    const saved = localStorage.getItem("amh_custom_gallery");
    if (saved) {
      try {
        customItems = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse amh_custom_gallery:", e);
      }
    }

    // Also sync any uploaded student homework scans from amh_homework_submissions
    const hwSubmissionsSaved = localStorage.getItem("amh_homework_submissions");
    const hwItems: GalleryItem[] = [];
    if (hwSubmissionsSaved) {
      try {
        const subs = JSON.parse(hwSubmissionsSaved);
        if (Array.isArray(subs)) {
          subs.forEach((sub: any) => {
            if (sub.file_url && (sub.file_url.startsWith("data:image/") || sub.file_url.startsWith("blob:") || sub.file_url.startsWith("http"))) {
              hwItems.push({
                id: `hw-sub-${sub.id}`,
                title: sub.file_name ? `Homework Scan: ${sub.file_name}` : "Homework Solution Scan",
                category: "Study Materials",
                description: sub.notes || `Uploaded math homework solution scan submitted on ${sub.created_at || "recently"}.`,
                type: "image",
                url: sub.file_url,
                isUserUploaded: true,
                uploadedAt: sub.created_at ? `${sub.created_at} (SAST)` : "Recently",
                tags: ["Homework Scan", "Student Work"],
                altText: sub.file_name ? `Student math homework scan for ${sub.file_name}` : "Student math homework solution scan",
                caption: sub.notes || "Uploaded student homework worksheet scan."
              });
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse amh_homework_submissions for gallery:", e);
      }
    }

    // Load deleted item IDs
    let deletedIdsSet = new Set<string>();
    const deletedSaved = localStorage.getItem("amh_deleted_gallery_ids");
    if (deletedSaved) {
      try {
        deletedIdsSet = new Set(JSON.parse(deletedSaved));
      } catch (e) {
        console.error("Failed to parse amh_deleted_gallery_ids:", e);
      }
    }

    // Load saved category overrides
    let savedCategoriesMap: Record<string, string> = {};
    const savedCategoriesRaw = localStorage.getItem("amh_gallery_categories");
    if (savedCategoriesRaw) {
      try {
        savedCategoriesMap = JSON.parse(savedCategoriesRaw);
      } catch (e) {
        console.error("Failed to parse amh_gallery_categories:", e);
      }
    }

    // Load saved captions & alt text mapping
    let savedCaptionsMap: Record<string, { caption?: string; altText?: string }> = {};
    const savedCaptionsRaw = localStorage.getItem("amh_gallery_captions");
    if (savedCaptionsRaw) {
      try {
        savedCaptionsMap = JSON.parse(savedCaptionsRaw);
      } catch (e) {
        console.error("Failed to parse amh_gallery_captions:", e);
      }
    }

    // Load saved tags mapping
    let savedTagsMap: Record<string, string[]> = {};
    const savedTagsRaw = localStorage.getItem("amh_gallery_tags");
    if (savedTagsRaw) {
      try {
        savedTagsMap = JSON.parse(savedTagsRaw);
      } catch (e) {
        console.error("Failed to parse amh_gallery_tags:", e);
      }
    }

    // Load saved favorites set
    let savedFavoritesSet = new Set<string>();
    const savedFavoritesRaw = localStorage.getItem("amh_gallery_favorites");
    if (savedFavoritesRaw) {
      try {
        const favArray: string[] = JSON.parse(savedFavoritesRaw);
        if (Array.isArray(favArray)) {
          savedFavoritesSet = new Set(favArray);
        }
      } catch (e) {
        console.error("Failed to parse amh_gallery_favorites:", e);
      }
    }

    // Unshift user uploads to top, followed by defaults
    const combinedUserItems = [...customItems, ...hwItems];
    let allCombined = [...combinedUserItems, ...DEFAULT_GALLERY]
      .filter(item => !deletedIdsSet.has(item.id))
      .map(item => {
        let category = item.category;
        if (savedCategoriesMap[item.id]) {
          category = savedCategoriesMap[item.id];
        }
        let caption = item.caption;
        let altText = item.altText;
        if (savedCaptionsMap[item.id]) {
          caption = savedCaptionsMap[item.id].caption ?? item.caption;
          altText = savedCaptionsMap[item.id].altText ?? item.altText;
        }
        let tags = item.tags || [];
        if (savedTagsMap[item.id]) {
          tags = savedTagsMap[item.id];
        }
        let isFavorite = item.isFavorite || savedFavoritesSet.has(item.id);
        return {
          ...item,
          category,
          caption,
          altText,
          tags,
          isFavorite,
        };
      });

    // Sort by custom saved order if available
    const savedOrderRaw = localStorage.getItem("amh_gallery_item_order");
    if (savedOrderRaw) {
      try {
        const orderIds: string[] = JSON.parse(savedOrderRaw);
        if (Array.isArray(orderIds) && orderIds.length > 0) {
          const orderMap = new Map<string, number>();
          orderIds.forEach((id, idx) => orderMap.set(id, idx));
          allCombined.sort((a, b) => {
            const indexA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
            const indexB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
            return indexA - indexB;
          });
        }
      } catch (e) {
        console.error("Failed to parse amh_gallery_item_order:", e);
      }
    }

    setItems(allCombined);

    // Load saved annotations
    const savedAnn = localStorage.getItem("amh_gallery_annotations");
    if (savedAnn) {
      try {
        setAnnotations(JSON.parse(savedAnn));
      } catch (e) {
        console.error("Failed to load annotations:", e);
      }
    }
  }, []);

  // Drag and Drop Rearrange Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedItemId;
    if (!sourceId || sourceId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const currentItems = [...items];
    const sourceIndex = currentItems.findIndex(i => i.id === sourceId);
    const targetIndex = currentItems.findIndex(i => i.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const [movedItem] = currentItems.splice(sourceIndex, 1);
      currentItems.splice(targetIndex, 0, movedItem);

      setItems(currentItems);
      const orderIds = currentItems.map(i => i.id);
      localStorage.setItem("amh_gallery_item_order", JSON.stringify(orderIds));

      setBatchSuccessMessage(`↔️ Photos reordered! Saved new layout.`);
      setTimeout(() => setBatchSuccessMessage(""), 3000);
    }

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  // Auto-play Slideshow Timer Effect
  useEffect(() => {
    if (!isSlideshowActive || !slideshowIsPlaying) return;

    const activeItems = slideshowCategory === "All"
      ? items
      : items.filter(i => i.category === slideshowCategory || i.category.includes(slideshowCategory));

    if (activeItems.length === 0) return;

    const interval = setInterval(() => {
      setSlideshowIndex(prev => (prev + 1) % activeItems.length);
    }, slideshowIntervalMs);

    return () => clearInterval(interval);
  }, [isSlideshowActive, slideshowIsPlaying, slideshowCategory, slideshowIntervalMs, items]);

  // Open Cropper Tool Modal
  const openCropper = (imageSrc: string, targetType: "upload" | "camera" | "existing", targetId?: string) => {
    if (!canManageGallery) {
      alert("Permission Denied: Only Super Admin can crop or edit gallery photos.");
      return;
    }
    setCropImageSrc(imageSrc);
    setCropTargetType(targetType);
    setCropTargetId(targetId);
    setCropAspectRatio("4:3");
    setCropZoom(1);
    setCropRotation(0);
    setCropOffsetX(0);
    setCropOffsetY(0);
    setCropModalOpen(true);
  };

  // Apply Crop on Canvas & Update Image Data
  const handleApplyCrop = () => {
    if (!canManageGallery) return;
    if (!cropImageSrc) return;

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let targetWidth = 1200;
      let targetHeight = 900;

      if (cropAspectRatio === "1:1") {
        targetWidth = 1000;
        targetHeight = 1000;
      } else if (cropAspectRatio === "4:3") {
        targetWidth = 1200;
        targetHeight = 900;
      } else if (cropAspectRatio === "16:9") {
        targetWidth = 1200;
        targetHeight = 675;
      } else if (cropAspectRatio === "3:2") {
        targetWidth = 1200;
        targetHeight = 800;
      } else if (cropAspectRatio === "free") {
        targetWidth = img.width;
        targetHeight = img.height;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.save();
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((cropRotation * Math.PI) / 180);
      ctx.scale(cropZoom, cropZoom);

      const panX = (cropOffsetX / 100) * (targetWidth / 2);
      const panY = (cropOffsetY / 100) * (targetHeight / 2);

      const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;

      ctx.drawImage(img, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
      ctx.restore();

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.92);

      if (cropTargetType === "upload") {
        setUploadFileBase64(croppedBase64);
        setBatchSuccessMessage("✂️ Image cropped and aspect ratio normalized!");
        setTimeout(() => setBatchSuccessMessage(""), 3000);
      } else if (cropTargetType === "camera") {
        setCapturedImage(croppedBase64);
        setBatchSuccessMessage("✂️ Camera photo cropped successfully!");
        setTimeout(() => setBatchSuccessMessage(""), 3000);
      } else if (cropTargetType === "existing" && cropTargetId) {
        const updatedItems = items.map(item => 
          item.id === cropTargetId ? { ...item, url: croppedBase64 } : item
        );
        setItems(updatedItems);
        saveToLocalStorage(updatedItems);
        setBatchSuccessMessage("✂️ Photo cropped and updated in gallery!");
        setTimeout(() => setBatchSuccessMessage(""), 3000);
      }

      setCropModalOpen(false);
      setCropImageSrc("");
    };
    img.src = cropImageSrc;
  };

  // Save updated Category, Caption, Alt Text & Tags for an item
  const handleSaveCaptionAndAltText = (itemId: string, customAltText?: string, customCaption?: string, customCategory?: string, customTags?: string[]) => {
    if (!canManageGallery) {
      alert("Permission Denied: Only Super Admin can update photo details.");
      return;
    }
    const finalAltText = customAltText !== undefined ? customAltText : editAltTextValue;
    const finalCaption = customCaption !== undefined ? customCaption : editCaptionValue;
    const finalCategory = customCategory !== undefined ? customCategory : editCategoryValue;
    const finalTags = customTags !== undefined ? customTags : editTagsValue;

    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          category: finalCategory,
          altText: finalAltText,
          caption: finalCaption,
          tags: finalTags,
        };
      }
      return item;
    });

    setItems(updatedItems);
    saveToLocalStorage(updatedItems);

    // Persist category override in amh_gallery_categories
    try {
      const savedCategoriesRaw = localStorage.getItem("amh_gallery_categories");
      let map: Record<string, string> = {};
      if (savedCategoriesRaw) {
        try { map = JSON.parse(savedCategoriesRaw); } catch (e) {}
      }
      map[itemId] = finalCategory;
      localStorage.setItem("amh_gallery_categories", JSON.stringify(map));
    } catch (e) {
      console.error("Failed to save amh_gallery_categories:", e);
    }

    // Persist tags in amh_gallery_tags
    try {
      const savedTagsRaw = localStorage.getItem("amh_gallery_tags");
      let map: Record<string, string[]> = {};
      if (savedTagsRaw) {
        try { map = JSON.parse(savedTagsRaw); } catch (e) {}
      }
      map[itemId] = finalTags;
      localStorage.setItem("amh_gallery_tags", JSON.stringify(map));
    } catch (e) {
      console.error("Failed to save amh_gallery_tags:", e);
    }

    // Persist in dedicated amh_gallery_captions localStorage key
    try {
      const savedCaptionsRaw = localStorage.getItem("amh_gallery_captions");
      let map: Record<string, { caption?: string; altText?: string }> = {};
      if (savedCaptionsRaw) {
        try { map = JSON.parse(savedCaptionsRaw); } catch (e) {}
      }
      map[itemId] = { caption: finalCaption, altText: finalAltText };
      localStorage.setItem("amh_gallery_captions", JSON.stringify(map));
    } catch (e) {
      console.error("Failed to save amh_gallery_captions:", e);
    }

    setCaptionSaveSuccess("✅ Photo details, category & tags updated!");
    setEditingCaptionId(null);
    setTimeout(() => setCaptionSaveSuccess(""), 3500);
  };

  // Direct Tag Saver Helper
  const handleSaveTags = (itemId: string, newTags: string[]) => {
    if (!canManageGallery) {
      alert("Permission Denied: Only Super Admin can edit photo tags.");
      return;
    }
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          tags: newTags,
        };
      }
      return item;
    });

    setItems(updatedItems);
    saveToLocalStorage(updatedItems);

    try {
      const savedTagsRaw = localStorage.getItem("amh_gallery_tags");
      let map: Record<string, string[]> = {};
      if (savedTagsRaw) {
        try { map = JSON.parse(savedTagsRaw); } catch (e) {}
      }
      map[itemId] = newTags;
      localStorage.setItem("amh_gallery_tags", JSON.stringify(map));
    } catch (e) {
      console.error("Failed to save amh_gallery_tags:", e);
    }

    setCaptionSaveSuccess("🏷️ Tags & descriptive labels updated!");
    setTimeout(() => setCaptionSaveSuccess(""), 3500);
  };

  // Toggle Favorite status for a single item
  const handleToggleFavorite = (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let isNowFavorite = false;
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        isNowFavorite = !item.isFavorite;
        return { ...item, isFavorite: isNowFavorite };
      }
      return item;
    });

    setItems(updatedItems);

    try {
      const favIds = updatedItems.filter(i => i.isFavorite).map(i => i.id);
      localStorage.setItem("amh_gallery_favorites", JSON.stringify(favIds));
    } catch (err) {
      console.error("Failed to save amh_gallery_favorites:", err);
    }

    setCaptionSaveSuccess(isNowFavorite ? "⭐ Added to Favorites!" : "Removed from Favorites");
    setTimeout(() => setCaptionSaveSuccess(""), 3000);
  };

  // Bulk toggle favorites for selected items
  const handleBatchFavorite = (favoriteState: boolean) => {
    if (selectedIds.length === 0) return;

    const selectedSet = new Set(selectedIds);
    const updatedItems = items.map(item => {
      if (selectedSet.has(item.id)) {
        return { ...item, isFavorite: favoriteState };
      }
      return item;
    });

    setItems(updatedItems);

    try {
      const favIds = updatedItems.filter(i => i.isFavorite).map(i => i.id);
      localStorage.setItem("amh_gallery_favorites", JSON.stringify(favIds));
    } catch (err) {
      console.error("Failed to save amh_gallery_favorites:", err);
    }

    setBatchSuccessMessage(
      favoriteState
        ? `⭐ Marked ${selectedIds.length} photo${selectedIds.length > 1 ? "s" : ""} as Favorite!`
        : `Unfavorited ${selectedIds.length} photo${selectedIds.length > 1 ? "s" : ""}`
    );
    setSelectedIds([]);
    setTimeout(() => setBatchSuccessMessage(""), 3500);
  };

  // Move selected photos to another category
  const handleBatchMoveCategory = (targetCategory: string) => {
    if (!canManageGallery) {
      alert("Permission Denied: Only Super Admin can move gallery photos.");
      return;
    }
    if (selectedIds.length === 0 || !targetCategory) return;

    const updatedItems = items.map(item => {
      if (selectedIds.includes(item.id)) {
        return { ...item, category: targetCategory };
      }
      return item;
    });

    setItems(updatedItems);
    saveToLocalStorage(updatedItems);

    try {
      const savedCategoriesRaw = localStorage.getItem("amh_gallery_categories");
      let map: Record<string, string> = {};
      if (savedCategoriesRaw) {
        try { map = JSON.parse(savedCategoriesRaw); } catch (e) {}
      }
      selectedIds.forEach(id => {
        map[id] = targetCategory;
      });
      localStorage.setItem("amh_gallery_categories", JSON.stringify(map));
    } catch (e) {
      console.error("Failed to save amh_gallery_categories:", e);
    }

    setBatchSuccessMessage(`📁 Moved ${selectedIds.length} photo${selectedIds.length > 1 ? "s" : ""} to "${targetCategory}"!`);
    setSelectedIds([]);
    setTimeout(() => setBatchSuccessMessage(""), 4000);
  };

  const saveToLocalStorage = (customItems: GalleryItem[]) => {
    const customOnly = customItems.filter(item => item.isUserUploaded && !item.id.startsWith("hw-sub-"));
    try {
      localStorage.setItem("amh_custom_gallery", JSON.stringify(customOnly));
    } catch (e) {
      console.warn("localStorage quota exceeded for custom gallery, storing recent items:", e);
      try {
        // Fallback to storing recent 12 items if quota is exceeded
        localStorage.setItem("amh_custom_gallery", JSON.stringify(customOnly.slice(0, 12)));
      } catch (err) {
        console.error("Could not write custom gallery to localStorage:", err);
      }
    }
  };

  const saveAnnotationsToStorage = (newAnnotations: Record<string, { drawings?: string; textNotes?: { id: string; text: string; x: number; y: number }[] }>) => {
    if (!canManageGallery) return;
    setAnnotations(newAnnotations);
    try {
      localStorage.setItem("amh_gallery_annotations", JSON.stringify(newAnnotations));
    } catch (e) {
      console.warn("Could not save gallery annotations to storage:", e);
    }
  };

  // Category badge color mapping
  const getCategoryBadgeClass = (category: string) => {
    if (category === "Classroom" || category === "Classroom & HQ") {
      return "bg-royal-600/90 text-white border-royal-400/40";
    }
    if (category === "Events" || category === "Events & Success" || category === "Success Stories") {
      return "bg-emerald-600/90 text-white border-emerald-400/40";
    }
    if (category === "Worksheets" || category === "Worksheets & Scans") {
      return "bg-purple-600/90 text-white border-purple-400/40";
    }
    if (category === "Digital Whiteboards") {
      return "bg-indigo-600/90 text-white border-indigo-400/40";
    }
    if (category === "Study Materials") {
      return "bg-amber-600/90 text-white border-amber-400/40";
    }
    return "bg-navy-900/80 text-white border-navy-750";
  };

  // Category filtering tabs list
  const tabs = ["All", "⭐ Favorites", "Classroom", "Events", "Worksheets", "Digital Whiteboards", "Study Materials", "My Uploads"];

  // Get item count for a specific tab category
  const getTabItemCount = (tabName: string) => {
    if (tabName === "All") return items.length;
    if (tabName === "⭐ Favorites" || tabName === "Favorites") return items.filter(i => i.isFavorite === true).length;
    if (tabName === "My Uploads") return items.filter(i => i.isUserUploaded === true).length;
    if (tabName === "Classroom") return items.filter(i => i.category === "Classroom" || i.category === "Classroom & HQ").length;
    if (tabName === "Events") return items.filter(i => i.category === "Events" || i.category === "Events & Success" || i.category === "Success Stories" || i.category === "Events & Celebrations").length;
    if (tabName === "Worksheets") return items.filter(i => i.category === "Worksheets" || i.category === "Worksheets & Scans" || i.category === "Worksheets & Solutions" || (i.tags && i.tags.some(t => t.toLowerCase().includes("worksheet") || t.toLowerCase().includes("homework")))).length;
    return items.filter(i => i.category === tabName).length;
  };

  // Get all unique tags currently present across all items for dynamic filtering
  const allAvailableTags = Array.from(
    new Set(items.flatMap(item => item.tags || []))
  ).filter(Boolean);

  // Filter items based on active tab, active tag, and search query (including tag name search)
  const filteredItems = items.filter(item => {
    let matchesTab = false;
    if (activeTab === "All") {
      matchesTab = true;
    } else if (activeTab === "⭐ Favorites" || activeTab === "Favorites") {
      matchesTab = item.isFavorite === true;
    } else if (activeTab === "My Uploads") {
      matchesTab = item.isUserUploaded === true;
    } else if (activeTab === "Classroom") {
      matchesTab = item.category === "Classroom" || item.category === "Classroom & HQ";
    } else if (activeTab === "Events") {
      matchesTab = item.category === "Events" || item.category === "Events & Success" || item.category === "Success Stories" || item.category === "Events & Celebrations";
    } else if (activeTab === "Worksheets") {
      matchesTab = item.category === "Worksheets" || item.category === "Worksheets & Scans" || item.category === "Worksheets & Solutions" || (item.tags && item.tags.some(t => t.toLowerCase().includes("worksheet") || t.toLowerCase().includes("homework")));
    } else {
      matchesTab = item.category === activeTab;
    }

    const matchesTag = !activeTag || (item.tags && item.tags.includes(activeTag));
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesTab && matchesTag && matchesSearch;
  });

  // Lightbox operations
  const openLightbox = (id: string) => {
    const index = filteredItems.findIndex(item => item.id === id);
    if (index !== -1) {
      setLightboxIndex(index);
      setZoomLevel(1);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setZoomLevel(1);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const navigateLightbox = (direction: "next" | "prev") => {
    if (lightboxIndex === null) return;
    let nextIndex = direction === "next" ? lightboxIndex + 1 : lightboxIndex - 1;
    if (nextIndex >= filteredItems.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = filteredItems.length - 1;
    }
    setLightboxIndex(nextIndex);
    setZoomLevel(1);
  };

  // Synchronize edit values whenever lightbox item changes
  useEffect(() => {
    if (lightboxIndex !== null && filteredItems[lightboxIndex]) {
      const current = filteredItems[lightboxIndex];
      setEditAltTextValue(current.altText || current.title || "");
      setEditCaptionValue(current.caption || "");
      setEditingCaptionId(null);
    }
  }, [lightboxIndex]);

  const handleDownloadMedia = () => {
    if (lightboxIndex === null || !filteredItems[lightboxIndex]) return;
    const item = filteredItems[lightboxIndex];
    const link = document.createElement("a");
    link.href = item.url;
    const ext = item.type === "video" ? "mp4" : "png";
    const cleanTitle = item.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    link.download = `AMH_${cleanTitle}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleImageDoubleClick = () => {
    setZoomLevel(prev => (prev === 1 ? 2 : 1));
  };

  // Keyboard & Wheel support for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      if (e.key === "Escape") closeLightbox();
      if (!annotationMode) {
        if (e.key === "ArrowRight") navigateLightbox("next");
        if (e.key === "ArrowLeft") navigateLightbox("prev");
        if (e.key === "+" || e.key === "=") setZoomLevel(prev => Math.min(3, prev + 0.25));
        if (e.key === "-") setZoomLevel(prev => Math.max(0.5, prev - 0.25));
        if (e.key === "0") setZoomLevel(1);
        if (e.key === "f" || e.key === "F") handleToggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, annotationMode]);

  // Load / Reset active annotations when lightbox item changes
  useEffect(() => {
    if (lightboxIndex !== null && filteredItems[lightboxIndex]) {
      const activeItem = filteredItems[lightboxIndex];
      const savedAnn = annotations[activeItem.id];
      setLocalTextNotes(savedAnn?.textNotes || []);
    } else {
      setLocalTextNotes([]);
    }
    setAnnotationMode(false);
    setTempNoteCoords(null);
    setNewNoteText("");
    setDrawingTool("draw");
    setUndoStack([]);
  }, [lightboxIndex]);

  // Load drawing onto canvas when editing is enabled
  useEffect(() => {
    if (annotationMode && canvasRef.current && lightboxIndex !== null && filteredItems[lightboxIndex]) {
      const activeItem = filteredItems[lightboxIndex];
      const savedAnn = annotations[activeItem.id];
      const canvas = canvasRef.current;
      
      canvas.width = imageResolution.width;
      canvas.height = imageResolution.height;
      
      const ctx = canvas.getContext("2d");
      if (ctx && savedAnn && savedAnn.drawings) {
        const img = new window.Image();
        img.src = savedAnn.drawings;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setUndoStack([savedAnn.drawings]);
        };
      } else if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setUndoStack([]);
      }
    }
  }, [annotationMode, lightboxIndex, imageResolution]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    setImageResolution({
      width: img.naturalWidth || 1200,
      height: img.naturalHeight || 900
    });
  };

  // Drawing Canvas Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (drawingTool === "text") {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          return;
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const xPercent = ((clientX - rect.left) / rect.width) * 100;
      const yPercent = ((clientY - rect.top) / rect.height) * 100;
      setTempNoteCoords({ x: xPercent, y: yPercent });
      return;
    }

    isDrawing.current = true;
    const { x, y } = getCanvasCoords(e);
    lastX.current = x;
    lastY.current = y;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = drawingTool === "eraser" ? "#000000" : brushColor;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = drawingTool === "eraser" ? "destination-out" : "source-over";
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || drawingTool === "text") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoords(e);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    lastX.current = x;
    lastY.current = y;
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const state = canvas.toDataURL();
      setUndoStack(prev => [...prev, state]);
    }
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (undoStack.length <= 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setUndoStack([]);
    } else {
      const nextStack = [...undoStack];
      nextStack.pop();
      const prevState = nextStack[nextStack.length - 1];
      
      const img = new window.Image();
      img.src = prevState;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setUndoStack(nextStack);
      };
    }
  };

  const handleClearAnnotations = () => {
    if (confirm("Are you sure you want to clear all current drawings and text notes on this image?")) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setUndoStack([]);
      setLocalTextNotes([]);
      setTempNoteCoords(null);
    }
  };

  const handleSaveAnnotations = () => {
    if (lightboxIndex === null || !filteredItems[lightboxIndex]) return;
    const activeItem = filteredItems[lightboxIndex];
    
    const canvas = canvasRef.current;
    let drawingsDataUrl = "";
    if (canvas) {
      drawingsDataUrl = canvas.toDataURL();
    } else {
      drawingsDataUrl = annotations[activeItem.id]?.drawings || "";
    }

    const updatedAnnotations = {
      ...annotations,
      [activeItem.id]: {
        drawings: drawingsDataUrl,
        textNotes: localTextNotes
      }
    };

    saveAnnotationsToStorage(updatedAnnotations);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleAddTextNote = () => {
    if (!tempNoteCoords || !newNoteText.trim()) return;
    
    const newNote = {
      id: "note-" + Date.now(),
      text: newNoteText.trim(),
      x: tempNoteCoords.x,
      y: tempNoteCoords.y
    };
    
    setLocalTextNotes(prev => [...prev, newNote]);
    setNewNoteText("");
    setTempNoteCoords(null);
  };

  const handleDeleteTextNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalTextNotes(prev => prev.filter(n => n.id !== id));
  };

  // Handle Camera stream life-cycle
  useEffect(() => {
    if (showCameraModal) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showCameraModal]);

  // Camera Actions
  const startCamera = async () => {
    setCameraError("");
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Could not access your camera. Please ensure camera permissions are allowed in your browser settings.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleSaveCameraPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageGallery) {
      setCameraError("Permission Denied: Only Super Admin can capture and save new photos.");
      return;
    }
    if (!capturedImage) {
      setCameraError("Please capture a photo before saving.");
      return;
    }

    const saTime = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });

    const combinedTags = [
      ...cameraSelectedTags,
      ...cameraCustomTags
    ].filter(Boolean);

    const finalTitle = cameraTitle.trim() || "Camera Math Capture";
    const finalDesc = cameraDesc.trim() || "Live camera photo captured in Amaris Media Hub.";

    const newItem: GalleryItem = {
      id: "camera-" + Date.now(),
      title: finalTitle,
      category: cameraCategory,
      description: finalDesc,
      type: "image",
      url: capturedImage,
      isUserUploaded: true,
      uploadedAt: `${saTime} (SAST)`,
      tags: combinedTags,
      altText: cameraAltText.trim() || finalTitle,
      caption: cameraCaption.trim()
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    saveToLocalStorage(updatedItems);

    // Reset fields & close modal
    setCameraTitle("");
    setCameraDesc("");
    setCameraAltText("");
    setCameraCaption("");
    setCapturedImage(null);
    setShowCameraModal(false);
    setCameraError("");
    setCameraSelectedTags([]);
    setCameraCustomTags([]);
    setNewCameraCustomTag("");

    setActiveTab("My Uploads");
    setActiveTag(null);
    setBatchSuccessMessage("🎉 Camera photo captured & saved to gallery!");
    setTimeout(() => setBatchSuccessMessage(""), 4000);
  };

  // Compress Image Helper to support 100+ photos without exceeding memory/storage limits
  const compressImage = (file: File, maxWidth = 1280, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve((e.target?.result as string) || "");
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || "");
        img.src = (e.target?.result as string) || "";
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  // Handle Drag & Drop Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processMultipleFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const validFiles = files.filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (validFiles.length === 0) {
      setUploadError("Invalid file selection. Please select image (.jpg, .png, .webp) or video files.");
      return;
    }

    setUploadError("");
    setBatchFiles(validFiles);

    if (validFiles.length === 1) {
      const file = validFiles[0];
      const isVideo = file.type.startsWith("video/");
      setUploadType(isVideo ? "video" : "image");
      const compressed = await compressImage(file);
      setUploadFileBase64(compressed);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    } else {
      // Multiple items (e.g. 100+ photos)
      setUploadFileBase64("");
      setUploadType("image");
      if (!uploadTitle) {
        setUploadTitle("Batch Uploaded Media");
      }
      if (!uploadDesc) {
        setUploadDesc(`Collection of ${validFiles.length} photos uploaded to Amaris Media Hub.`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      processMultipleFiles(filesArray);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processMultipleFiles(filesArray);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageGallery) {
      setUploadError("Permission Denied: Only Super Admin can upload new media.");
      return;
    }

    if (batchFiles.length > 1) {
      // Bulk process 100+ files efficiently
      setIsProcessingBatch(true);
      setUploadError("");
      const saTime = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });
      const combinedTags = [...uploadSelectedTags, ...uploadCustomTags].filter(Boolean);

      const newItems: GalleryItem[] = [];
      const total = batchFiles.length;

      for (let i = 0; i < total; i++) {
        setBatchProgress({ current: i + 1, total });
        const file = batchFiles[i];
        const isVideo = file.type.startsWith("video/");
        const fileBase64 = await compressImage(file);

        if (!fileBase64) continue;

        const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const title = uploadTitle.trim() 
          ? `${uploadTitle.trim()} #${i + 1}`
          : baseName || `Photo #${i + 1}`;

        const desc = uploadDesc.trim() || `Batch photo ${i + 1} of ${total} uploaded to Amaris Gallery.`;

        newItems.push({
          id: `user-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          title: title,
          category: uploadCategory,
          description: desc,
          type: isVideo ? "video" : "image",
          url: fileBase64,
          isUserUploaded: true,
          uploadedAt: `${saTime} (SAST)`,
          tags: combinedTags,
          altText: uploadAltText.trim() || title,
          caption: uploadCaption.trim()
        });
      }

      const updatedItems = [...newItems, ...items];
      setItems(updatedItems);
      saveToLocalStorage(updatedItems);

      setIsProcessingBatch(false);
      setBatchProgress(null);
      setBatchFiles([]);
      setUploadTitle("");
      setUploadDesc("");
      setUploadAltText("");
      setUploadCaption("");
      setUploadFileBase64("");
      setShowUploadModal(false);
      setUploadError("");
      setUploadSelectedTags([]);
      setUploadCustomTags([]);

      setActiveTab("My Uploads");
      setActiveTag(null);
      setBatchSuccessMessage(`🎉 Successfully uploaded ${newItems.length} photos! They are now visible below in 'My Uploads'.`);
      setTimeout(() => setBatchSuccessMessage(""), 5000);
      return;
    }

    // Single item processing
    let finalBase64 = uploadFileBase64;
    let isVideo = uploadType === "video";

    if (!finalBase64 && batchFiles.length === 1) {
      finalBase64 = await compressImage(batchFiles[0]);
      isVideo = batchFiles[0].type.startsWith("video/");
    }

    if (!finalBase64) {
      setUploadError("Please select or drop an image or video file to upload.");
      return;
    }

    const defaultTitle = batchFiles.length === 1 
      ? batchFiles[0].name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      : "Uploaded Math Photo";

    const finalTitle = uploadTitle.trim() || defaultTitle;
    const finalDesc = uploadDesc.trim() || "Uploaded media saved to Amaris Mathematics Hub Gallery.";

    const saTime = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });
    const combinedTags = [...uploadSelectedTags, ...uploadCustomTags].filter(Boolean);

    const newItem: GalleryItem = {
      id: "user-" + Date.now(),
      title: finalTitle,
      category: uploadCategory,
      description: finalDesc,
      type: isVideo ? "video" : "image",
      url: finalBase64,
      isUserUploaded: true,
      uploadedAt: `${saTime} (SAST)`,
      tags: combinedTags,
      altText: uploadAltText.trim() || finalTitle,
      caption: uploadCaption.trim()
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    saveToLocalStorage(updatedItems);

    setUploadTitle("");
    setUploadDesc("");
    setUploadAltText("");
    setUploadCaption("");
    setUploadFileBase64("");
    setBatchFiles([]);
    setShowUploadModal(false);
    setUploadError("");
    setUploadSelectedTags([]);
    setUploadCustomTags([]);
    setNewUploadCustomTag("");

    setActiveTab("My Uploads");
    setActiveTag(null);
    setBatchSuccessMessage("🎉 Photo successfully added to your gallery! Visible below in 'My Uploads'.");
    setTimeout(() => setBatchSuccessMessage(""), 4000);
  };

  const saveDeletedId = (id: string) => {
    try {
      const saved = localStorage.getItem("amh_deleted_gallery_ids");
      let ids: string[] = saved ? JSON.parse(saved) : [];
      if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem("amh_deleted_gallery_ids", JSON.stringify(ids));
      }
    } catch (e) {
      console.error("Failed to save deleted item ID:", e);
    }
  };

  const saveDeletedIds = (idList: string[]) => {
    try {
      const saved = localStorage.getItem("amh_deleted_gallery_ids");
      let ids: string[] = saved ? JSON.parse(saved) : [];
      idList.forEach(id => {
        if (!ids.includes(id)) ids.push(id);
      });
      localStorage.setItem("amh_deleted_gallery_ids", JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to save deleted item IDs:", e);
    }
  };

  const handleDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent opening lightbox
    if (!canManageGallery) {
      alert("Permission Denied: Only Super Admin can delete gallery items.");
      return;
    }
    const item = items.find(i => i.id === id);
    setDeleteConfirmModal({
      isOpen: true,
      type: "single",
      targetId: id,
      targetTitle: item?.title || "this photo"
    });
  };

  const handleDeleteItemFromLightbox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canManageGallery) {
      alert("Permission Denied: Only Super Admin can delete gallery items.");
      return;
    }
    const item = items.find(i => i.id === id);
    setDeleteConfirmModal({
      isOpen: true,
      type: "lightbox",
      targetId: id,
      targetTitle: item?.title || "this photo"
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const visibleDeletableItems = filteredItems;
  const isAllSelected = visibleDeletableItems.length > 0 && visibleDeletableItems.every(item => selectedIds.includes(item.id));

  const handleSelectAllToggle = () => {
    const visibleDeletableIds = visibleDeletableItems.map(item => item.id);
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleDeletableIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const uniqueIds = new Set([...prev, ...visibleDeletableIds]);
        return Array.from(uniqueIds);
      });
    }
  };

  const handleBulkDelete = () => {
    if (!canManageGallery) {
      alert("Permission Denied: Only Super Admin can delete gallery items.");
      return;
    }
    const targetIds = selectedIds.filter(id => items.some(item => item.id === id));
    if (targetIds.length === 0) return;
    setDeleteConfirmModal({
      isOpen: true,
      type: "bulk",
      targetIds: targetIds
    });
  };

  const handleRestoreDefaultPhotos = () => {
    if (!canManageGallery) {
      alert("Permission Denied: Only Super Admin can restore default photos.");
      return;
    }
    setDeleteConfirmModal({
      isOpen: true,
      type: "restore"
    });
  };

  // Execution of Delete Actions after user confirms in custom modal
  const confirmExecuteDelete = () => {
    const { type, targetId, targetIds } = deleteConfirmModal;

    if (type === "single" && targetId) {
      const itemToDelete = items.find(i => i.id === targetId);
      saveDeletedId(targetId);
      const updatedItems = items.filter(item => item.id !== targetId);
      setItems(updatedItems);
      saveToLocalStorage(updatedItems);
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== targetId));
      
      if (itemToDelete) {
        setRecentlyDeletedItems({ items: [itemToDelete], ids: [targetId] });
      }
      setBatchSuccessMessage(`🗑️ Photo "${itemToDelete?.title || ""}" successfully deleted.`);
      setTimeout(() => setBatchSuccessMessage(""), 6000);

    } else if (type === "lightbox" && targetId) {
      const itemToDelete = items.find(i => i.id === targetId);
      saveDeletedId(targetId);
      const updatedItems = items.filter(item => item.id !== targetId);
      setItems(updatedItems);
      saveToLocalStorage(updatedItems);
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== targetId));

      const newFiltered = filteredItems.filter(item => item.id !== targetId);
      if (newFiltered.length === 0) {
        setLightboxIndex(null);
      } else if (lightboxIndex !== null && lightboxIndex >= newFiltered.length) {
        setLightboxIndex(newFiltered.length - 1);
      }

      if (itemToDelete) {
        setRecentlyDeletedItems({ items: [itemToDelete], ids: [targetId] });
      }
      setBatchSuccessMessage(`🗑️ Photo "${itemToDelete?.title || ""}" successfully deleted.`);
      setTimeout(() => setBatchSuccessMessage(""), 6000);

    } else if (type === "bulk" && targetIds && targetIds.length > 0) {
      const itemsToDelete = items.filter(i => targetIds.includes(i.id));
      saveDeletedIds(targetIds);
      const updatedItems = items.filter(item => !targetIds.includes(item.id));
      setItems(updatedItems);
      saveToLocalStorage(updatedItems);
      setSelectedIds(prev => prev.filter(id => !targetIds.includes(id)));

      setRecentlyDeletedItems({ items: itemsToDelete, ids: targetIds });
      setBatchSuccessMessage(`🗑️ Successfully deleted ${targetIds.length} photo(s).`);
      setTimeout(() => setBatchSuccessMessage(""), 6000);

    } else if (type === "restore") {
      localStorage.removeItem("amh_deleted_gallery_ids");
      let customItems: GalleryItem[] = [];
      const saved = localStorage.getItem("amh_custom_gallery");
      if (saved) {
        try { customItems = JSON.parse(saved); } catch (e) {}
      }
      const hwSubmissionsSaved = localStorage.getItem("amh_homework_submissions");
      const hwItems: GalleryItem[] = [];
      if (hwSubmissionsSaved) {
        try {
          const subs = JSON.parse(hwSubmissionsSaved);
          if (Array.isArray(subs)) {
            subs.forEach((sub: any) => {
              if (sub.file_url && (sub.file_url.startsWith("data:image/") || sub.file_url.startsWith("blob:") || sub.file_url.startsWith("http"))) {
                hwItems.push({
                  id: `hw-sub-${sub.id}`,
                  title: sub.file_name ? `Homework Scan: ${sub.file_name}` : "Homework Solution Scan",
                  category: "Study Materials",
                  description: sub.notes || `Uploaded math homework solution scan submitted on ${sub.created_at || "recently"}.`,
                  type: "image",
                  url: sub.file_url,
                  isUserUploaded: true,
                  uploadedAt: sub.created_at ? `${sub.created_at} (SAST)` : "Recently",
                  tags: ["Homework Scan", "Student Work"]
                });
              }
            });
          }
        } catch (e) {}
      }
      setItems([...customItems, ...hwItems, ...DEFAULT_GALLERY]);
      setRecentlyDeletedItems(null);
      setBatchSuccessMessage("✨ Default showcase photos restored to gallery!");
      setTimeout(() => setBatchSuccessMessage(""), 4000);
    }

    setDeleteConfirmModal({ isOpen: false, type: "single" });
  };

  const handleUndoDelete = () => {
    if (!recentlyDeletedItems) return;
    
    // Remove deleted IDs from localStorage
    try {
      const saved = localStorage.getItem("amh_deleted_gallery_ids");
      if (saved) {
        let ids: string[] = JSON.parse(saved);
        ids = ids.filter(id => !recentlyDeletedItems.ids.includes(id));
        localStorage.setItem("amh_deleted_gallery_ids", JSON.stringify(ids));
      }
    } catch (e) {
      console.error("Failed to update deleted IDs on undo:", e);
    }

    // Merge deleted items back into current items
    const existingIds = new Set(items.map(i => i.id));
    const restoredItems = recentlyDeletedItems.items.filter(i => !existingIds.has(i.id));
    const combined = [...restoredItems, ...items];
    setItems(combined);
    saveToLocalStorage(combined);

    setBatchSuccessMessage(`✨ Deletion undone! Restored ${restoredItems.length} photo(s).`);
    setRecentlyDeletedItems(null);
    setTimeout(() => setBatchSuccessMessage(""), 4000);
  };

  return (
    <div className="pb-20 space-y-12">
      
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-950 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-royal-800/10 mix-blend-color-dodge pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-royal-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full">
            Media Showcases
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-none">
            Amaris <span className="text-gold-400">Media Gallery</span>
          </h1>
          <p className="text-xs sm:text-sm text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Witness our interactive learning environments, Pretoria HQ suite, whiteboard calculations, and celebrate the academic breakthroughs of our South African Matric upgrade graduates.
          </p>

          {/* ACCESS LEVEL BADGE */}
          <div className="pt-2 flex items-center justify-center">
            {canManageGallery ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-extrabold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Super Admin Gallery CRUD Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-extrabold backdrop-blur-md">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Viewer Mode (CRUD restricted to Super Admin)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* BATCH SUCCESS BANNER */}
      {batchSuccessMessage && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between text-emerald-800 dark:text-emerald-200 font-bold text-xs shadow-md animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{batchSuccessMessage}</span>
            </div>
            <div className="flex items-center gap-3">
              {recentlyDeletedItems && (
                <button
                  onClick={handleUndoDelete}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-sm transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo Delete</span>
                </button>
              )}
              <button 
                onClick={() => setBatchSuccessMessage("")}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FILTER CONTROLS & UTILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-navy-200 dark:border-navy-800 pb-6">
          
          {/* Tabs Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const count = getTabItemCount(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 text-xs font-extrabold rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === tab
                      ? "bg-royal-600 text-white shadow-md shadow-royal-600/20 ring-1 ring-royal-400/30"
                      : "bg-white dark:bg-navy-900 text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 border border-navy-150 dark:border-navy-800"
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      activeTab === tab
                        ? "bg-white/20 text-white"
                        : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-navy-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-navy-400 hover:text-navy-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Students & Admins Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setIsSlideshowActive(true);
                  setSlideshowIndex(0);
                  setSlideshowIsPlaying(true);
                  setSlideshowCategory(activeTab === "All" ? "All" : activeTab);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Start Auto-Play Slideshow mode"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Auto-Play Slideshow</span>
              </button>

              <button
                onClick={() => {
                  if (selectedIds.length > 0) {
                    setPrintItemIds([...selectedIds]);
                  } else {
                    setPrintItemIds(filteredItems.map(i => i.id));
                  }
                  setShowPrintModal(true);
                }}
                className="px-3.5 py-2 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-700 text-white border border-slate-700 dark:border-navy-700 text-xs font-extrabold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Format and print selected photos into a paper grid layout"
              >
                <Printer className="w-4 h-4 text-gold-400" />
                <span>Print Gallery</span>
              </button>

              {canManageGallery && (
                <>
                  <button
                    onClick={() => setShowCameraModal(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white text-xs font-extrabold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="Capture a photo directly with your camera"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Camera</span>
                  </button>

                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-950 text-xs font-extrabold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="Upload media photos and videos"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Media (100+)</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Dynamic Tags Filter Row */}
        {allAvailableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-navy-100 dark:border-navy-850">
            <span className="text-[10px] font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wider font-mono flex items-center gap-1.5 mr-1">
              <Tag className="w-3.5 h-3.5" />
              Filter by Topic:
            </span>
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                activeTag === null
                  ? "bg-gold-500 text-navy-950 shadow-sm font-extrabold"
                  : "bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800"
              }`}
            >
              All Topics
            </button>
            {allAvailableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                  activeTag === tag
                    ? "bg-gold-500 text-navy-950 shadow-sm font-extrabold"
                    : "bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-850 border border-navy-150 dark:border-navy-800"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* SELECTION & BULK ACTIONS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-navy-50 dark:bg-navy-950/40 border border-navy-150 dark:border-navy-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2.5 text-xs font-bold text-navy-800 dark:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                id="select-all-gallery-checkbox"
                checked={isAllSelected}
                onChange={handleSelectAllToggle}
                className="w-4.5 h-4.5 rounded border-navy-300 dark:border-navy-700 text-royal-600 focus:ring-royal-500 cursor-pointer bg-white dark:bg-navy-900"
              />
              <span className="font-display tracking-tight text-navy-900 dark:text-navy-100">
                Select All ({visibleDeletableItems.length} photos)
              </span>
            </label>

            {selectedIds.length > 0 && (
              <span className="text-xs text-navy-500 dark:text-navy-400 font-mono">
                | {selectedIds.length} selected
              </span>
            )}

            {canManageGallery && (
              <button
                onClick={handleRestoreDefaultPhotos}
                className="text-xs text-navy-500 hover:text-navy-800 dark:text-navy-400 dark:hover:text-gold-400 underline flex items-center gap-1 cursor-pointer transition-colors ml-auto sm:ml-0"
                title="Restore deleted default showcase photos"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Default Photos</span>
              </button>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleBatchFavorite(true)}
                className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-extrabold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                title="Mark selected photos as Favorites"
              >
                <Star className="w-3.5 h-3.5 fill-navy-950 text-navy-950" />
                <span>Favorite ({selectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchFavorite(false)}
                className="px-3 py-1.5 bg-white dark:bg-navy-900 hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-700 dark:text-navy-300 border border-navy-250 dark:border-navy-750 text-xs font-extrabold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                title="Remove selected photos from Favorites"
              >
                <Star className="w-3.5 h-3.5 text-navy-400" />
                <span>Unfavorite</span>
              </button>

              {canManageGallery && (
                <div className="flex items-center gap-1.5 bg-white dark:bg-navy-900 border border-navy-250 dark:border-navy-750 px-3 py-1.5 rounded-lg shadow-sm">
                  <Folder className="w-3.5 h-3.5 text-gold-500" />
                  <span className="text-xs font-bold text-navy-800 dark:text-navy-200 hidden md:inline">Move selected to:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBatchMoveCategory(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="bg-transparent text-xs font-black text-royal-600 dark:text-gold-400 focus:outline-none cursor-pointer border-none"
                    title="Select destination category to move selected photos"
                  >
                    <option value="" disabled className="bg-navy-950 text-white">Move to Category...</option>
                    {CATEGORIES.filter(c => c !== "All").map(cat => (
                      <option key={cat} value={cat} className="bg-navy-950 text-white">{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setPrintItemIds([...selectedIds]);
                  setShowPrintModal(true);
                }}
                className="px-3.5 py-1.5 bg-royal-600 hover:bg-royal-700 text-white text-xs font-extrabold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                title="Format selected photos into a paper print grid layout"
              >
                <Printer className="w-3.5 h-3.5 text-gold-400" />
                <span>Print Sheet ({selectedIds.length})</span>
              </button>

              {canManageGallery && (
                <button
                  id="bulk-delete-gallery-button"
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-extrabold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* GALLERY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 bg-navy-100 dark:bg-navy-900 rounded-full flex items-center justify-center text-navy-400 mx-auto">
              {activeTab.includes("Favorites") ? (
                <Star className="w-6 h-6 text-gold-400 fill-gold-400/20" />
              ) : (
                <HelpCircle className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              {activeTab.includes("Favorites") ? "No Favorite Photos Yet" : "No items found"}
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
              {activeTab.includes("Favorites")
                ? "Click the star icon on any photo card or in the lightbox to save your favorite classroom photos, worksheets, and proofs here."
                : "We couldn't find any photos or videos matching your filter combination. Try clearing your search query or upload a custom image."}
            </p>
            <button
              onClick={() => { setActiveTab("All"); setSearchQuery(""); }}
              className="text-xs font-bold text-royal-600 dark:text-gold-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layoutId={`gallery-item-${item.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  draggable={true}
                  onDragStart={(e: any) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={(e) => handleCardDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => openLightbox(item.id)}
                  className={`bg-white dark:bg-navy-900 border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col relative ${
                    dragOverItemId === item.id
                      ? "border-gold-500 ring-4 ring-gold-500/80 scale-[1.03] shadow-2xl z-30"
                      : draggedItemId === item.id
                      ? "opacity-40 scale-95 border-dashed border-navy-400"
                      : selectedIds.includes(item.id)
                      ? "border-gold-500 ring-2 ring-gold-500/20 dark:ring-gold-500/35 shadow-md"
                      : "border-navy-150 dark:border-navy-800"
                  }`}
                >
                  
                  {/* Media Wrapper */}
                  <div className="relative aspect-[4/3] bg-navy-100 dark:bg-navy-950 overflow-hidden shrink-0">
                    {item.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <video 
                          src={item.url} 
                          className="w-full h-full object-cover" 
                          muted 
                          playsInline 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                            <Video className="w-5 h-5 fill-current" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.altText || item.caption || item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop";
                        }}
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Drag Handle & Checkbox overlay */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 left-3 z-20 flex items-center gap-1.5"
                    >
                      {canManageGallery && (
                        <div 
                          className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm cursor-grab active:cursor-grabbing shadow transition"
                          title="Click & Drag to rearrange photo order"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-4.5 h-4.5 rounded border-navy-300 dark:border-navy-700 text-royal-600 focus:ring-royal-500 cursor-pointer bg-white dark:bg-navy-900 shadow-sm transition-all"
                        title="Select photo for batch actions"
                      />
                    </div>

                    {/* Favorite, Crop, Tag & Delete Action Buttons Overlay */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 z-20 flex items-center gap-1.5"
                    >
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(item.id, e)}
                        className={`p-2 rounded-lg shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-sm ${
                          item.isFavorite
                            ? "bg-gold-500 text-navy-950 border border-gold-400"
                            : "bg-navy-950/80 hover:bg-navy-900 text-gold-400 border border-gold-500/40"
                        }`}
                        title={item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFavorite ? "fill-navy-950 text-navy-950" : ""}`} />
                      </button>

                      {canManageGallery && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTagsModalId(item.id);
                              setEditTagsValue(item.tags || []);
                              setNewEditTagInput("");
                            }}
                            className="p-2 bg-navy-950/80 hover:bg-navy-900 text-sky-400 border border-sky-500/40 rounded-lg shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
                            title="Add or edit descriptive tags/labels for this photo"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>

                          {item.type === "image" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCropper(item.url, "existing", item.id);
                              }}
                              className="p-2 bg-navy-950/80 hover:bg-navy-900 text-gold-400 border border-gold-500/40 rounded-lg shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
                              title="Crop photo to uniform aspect ratio"
                            >
                              <Crop className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                            title="Delete photo from gallery"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Category Overlay & Quick Category Switcher */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-3 left-3 z-20"
                    >
                      {canManageGallery ? (
                        <select
                          value={item.category}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSaveCaptionAndAltText(item.id, item.altText, item.caption, e.target.value);
                          }}
                          className={`px-2 py-0.5 border backdrop-blur-md text-[9px] font-mono rounded font-extrabold uppercase tracking-wider shadow-sm focus:outline-none cursor-pointer ${getCategoryBadgeClass(item.category)}`}
                          title="Click to move photo to another category"
                        >
                          {CATEGORIES.filter(c => c !== "All").map(cat => (
                            <option key={cat} value={cat} className="bg-navy-950 text-white font-sans">{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 border backdrop-blur-md text-[9px] font-mono rounded font-extrabold uppercase tracking-wider shadow-sm ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-4 text-left flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-navy-900 dark:text-white line-clamp-1 group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
                          {item.title}
                        </h3>
                        {item.isFavorite && (
                          <span title="Favorited item">
                            <Star className="w-4 h-4 text-gold-500 fill-gold-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Display Caption / Context Note if available */}
                      {item.caption && (
                        <div className="p-2 bg-navy-50/80 dark:bg-navy-950/80 border border-navy-150/60 dark:border-navy-800/60 rounded-lg text-[10.5px] text-navy-700 dark:text-navy-300 italic flex items-start gap-1.5">
                          <MessageSquare className="w-3 h-3 text-gold-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.caption}</span>
                        </div>
                      )}

                      {/* Display item tags & quick edit trigger */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTag(tag === activeTag ? null : tag);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold transition-colors cursor-pointer ${
                                activeTag === tag
                                  ? "bg-gold-500 text-navy-950 font-bold"
                                  : "bg-navy-50 hover:bg-navy-100 dark:bg-navy-950/60 dark:hover:bg-navy-900 text-navy-600 dark:text-navy-300 border border-navy-150/40 dark:border-navy-800/40"
                              }`}
                            >
                              #{tag}
                            </span>
                          ))
                        ) : null}

                        {canManageGallery && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTagsModalId(item.id);
                              setEditTagsValue(item.tags || []);
                              setNewEditTagInput("");
                            }}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition flex items-center gap-1 cursor-pointer"
                            title="Manage tags for this photo"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>{item.tags && item.tags.length > 0 ? "Tag" : "Add Tags"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {item.uploadedAt && (
                      <div className="pt-2 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between text-[9px] font-mono text-navy-400">
                        <span>🕒 {item.uploadedAt.split(" ")[0]}</span>
                        {item.isUserUploaded && (
                          <span className="text-gold-500 font-bold uppercase tracking-wider text-[8px]">My Upload</span>
                        )}
                      </div>
                    )}
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between overflow-hidden"
          >
            {/* Save Success Alert Overlay */}
            {saveSuccess && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400">
                <Check className="w-4 h-4" />
                <span>Annotations Successfully Saved!</span>
              </div>
            )}

            {/* Top Bar Controls */}
            <div className="p-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center select-none text-white z-20 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-royal-600 text-white text-[9px] font-mono font-bold rounded uppercase tracking-wider">
                    {filteredItems[lightboxIndex].category}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-white/80">
                    {lightboxIndex + 1} of {filteredItems.length}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-white/50">
                  {filteredItems[lightboxIndex].type === "video" ? "Video Clip" : "High-Res Image"}
                  {filteredItems[lightboxIndex].uploadedAt && ` • Registered: ${filteredItems[lightboxIndex].uploadedAt}`}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Annotate Tool Button - Super Admin Only */}
                {canManageGallery && filteredItems[lightboxIndex].type !== "video" && (
                  <button
                    onClick={() => {
                      setAnnotationMode(!annotationMode);
                      if (annotationMode) {
                        const savedAnn = annotations[filteredItems[lightboxIndex].id];
                        setLocalTextNotes(savedAnn?.textNotes || []);
                        setTempNoteCoords(null);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      annotationMode 
                        ? "bg-gold-500 text-navy-950 font-black shadow-md border border-gold-400" 
                        : "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{annotationMode ? "Exit Annotation" : "Annotate & Draw"}</span>
                  </button>
                )}

                {/* Zoom Controls */}
                {filteredItems[lightboxIndex].type !== "video" && (
                  <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg border border-white/10 text-xs text-white">
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                      className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                      title="Zoom Out (-)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="font-mono text-[10px] px-1 hover:text-gold-400 transition-colors cursor-pointer"
                      title="Reset Zoom to 100% (Press 0)"
                    >
                      {Math.round(zoomLevel * 100)}%
                    </button>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                      className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                      title="Zoom In (+)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Download Button */}
                <button
                  onClick={handleDownloadMedia}
                  className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Download File to Device"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Download</span>
                </button>

                {/* Fullscreen Toggle Button */}
                <button
                  onClick={handleToggleFullscreen}
                  className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white transition-colors cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen Mode (F)" : "Enter Fullscreen Mode (F)"}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Delete Photo Button in Lightbox - Super Admin Only */}
                {canManageGallery && (
                  <button
                    onClick={(e) => handleDeleteItemFromLightbox(filteredItems[lightboxIndex].id, e)}
                    className="p-2 bg-red-600/80 hover:bg-red-700 border border-red-500/50 rounded-lg text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Delete this photo from gallery"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                )}
                
                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="p-2 bg-red-600/80 hover:bg-red-600 border border-red-500/50 rounded-lg text-white transition-colors cursor-pointer"
                  title="Close Lightbox (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Middle Main Showcase Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden my-auto">
              <div className="w-full flex-1 flex items-center justify-between px-2 sm:px-8">
                {/* Left Navigate */}
                <button
                  onClick={() => navigateLightbox("prev")}
                  className="p-3 bg-white/10 hover:bg-white/25 rounded-full text-white border border-white/10 backdrop-blur transition-all shrink-0 cursor-pointer z-10 hover:scale-110 active:scale-95"
                  title="Previous image (←)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Active Media Display Container */}
                <div className="flex-1 max-w-5xl max-h-[72vh] flex items-center justify-center relative p-2 select-none overflow-auto">
                  <motion.div
                    key={filteredItems[lightboxIndex].id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    style={{ scale: zoomLevel }}
                    onDoubleClick={handleImageDoubleClick}
                    className="transition-transform duration-200 cursor-zoom-in"
                  >
                    {filteredItems[lightboxIndex].type === "video" ? (
                      <video
                        src={filteredItems[lightboxIndex].url}
                        controls
                        autoPlay
                        playsInline
                        className="max-w-full max-h-[68vh] rounded-2xl border border-white/10 shadow-2xl"
                      />
                    ) : (
                      <div className="relative inline-block select-none max-w-full max-h-[68vh]">
                        <img
                          src={filteredItems[lightboxIndex].url}
                          alt={filteredItems[lightboxIndex].altText || filteredItems[lightboxIndex].caption || filteredItems[lightboxIndex].title}
                          onLoad={handleImageLoad}
                          className="max-w-full max-h-[68vh] rounded-2xl border border-white/10 shadow-2xl object-contain block"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop";
                          }}
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Saved Drawings Overlay */}
                        {!annotationMode && annotations[filteredItems[lightboxIndex].id]?.drawings && (
                          <img
                            src={annotations[filteredItems[lightboxIndex].id].drawings}
                            alt="Drawings overlay"
                            className="absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none select-none z-10"
                          />
                        )}

                        {/* Floating Text Notes Overlay */}
                        {(annotationMode ? localTextNotes : (annotations[filteredItems[lightboxIndex].id]?.textNotes || [])).map((note) => {
                          return (
                            <div
                              key={note.id}
                              style={{ left: `${note.x}%`, top: `${note.y}%` }}
                              className="absolute z-20 group -translate-x-1/2 -translate-y-1/2"
                            >
                              {/* Note Pin */}
                              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gold-500 text-navy-950 font-black font-mono shadow-md text-[10px] border border-navy-950 hover:scale-125 transition-transform cursor-pointer">
                                !
                              </div>

                              {/* Hover / Active Note Bubble */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 bg-navy-950/95 border border-gold-500/40 text-white text-[11px] rounded-lg shadow-xl w-48 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 pointer-events-auto">
                                <p className="font-sans leading-normal text-white text-xs">{note.text}</p>
                                {annotationMode && (
                                  <button
                                    onClick={(e) => handleDeleteTextNote(note.id, e)}
                                    className="mt-1.5 px-1.5 py-0.5 bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white rounded text-[9px] font-mono font-bold transition-colors pointer-events-auto cursor-pointer"
                                  >
                                    Delete Note
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Dynamic Interactive Placement Input when text tool clicked */}
                        {annotationMode && tempNoteCoords && (
                          <div 
                            style={{ left: `${tempNoteCoords.x}%`, top: `${tempNoteCoords.y}%` }}
                            className="absolute z-40 bg-navy-900 border border-gold-500/60 p-3 rounded-xl shadow-2xl w-64 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto"
                          >
                            <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
                              <span className="text-[10px] font-mono text-gold-400 font-bold flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> Place Math Note
                              </span>
                              <button 
                                onClick={() => setTempNoteCoords(null)}
                                className="text-white/60 hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <textarea
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              placeholder="Type formula or correction note..."
                              rows={3}
                              className="text-xs bg-navy-950 border border-white/10 rounded-lg p-1.5 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-gold-500 font-sans"
                              autoFocus
                            />
                            
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setTempNoteCoords(null)}
                                className="px-2 py-0.5 text-[9px] text-white/70 hover:text-white bg-white/5 rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAddTextNote}
                                className="px-2.5 py-0.5 text-[9px] bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded flex items-center gap-0.5 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Note
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Canvas Drawing layer */}
                        {annotationMode && (
                          <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="absolute top-0 left-0 w-full h-full rounded-2xl cursor-crosshair z-10 touch-none select-none"
                          />
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Right Navigate */}
                <button
                  onClick={() => navigateLightbox("next")}
                  className="p-3 bg-white/10 hover:bg-white/25 rounded-full text-white border border-white/10 backdrop-blur transition-all shrink-0 cursor-pointer z-10 hover:scale-110 active:scale-95"
                  title="Next image (→)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Drawing Toolbar controls when in annotation mode */}
              {annotationMode && filteredItems[lightboxIndex].type !== "video" && (
                <div className="pb-3 px-4 z-20 max-w-4xl w-full">
                  <div className="bg-navy-950/90 border border-white/10 backdrop-blur-md rounded-xl p-3 flex flex-wrap items-center justify-center gap-4 shadow-xl">
                    {/* Brush & Tool Type Pickers */}
                    <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                      <button
                        onClick={() => setDrawingTool("draw")}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                          drawingTool === "draw" 
                            ? "bg-gold-500 text-navy-950" 
                            : "hover:bg-white/10 text-white"
                        }`}
                        title="Draw Freehand"
                      >
                        <Brush className="w-4 h-4" />
                        <span>Draw</span>
                      </button>

                      <button
                        onClick={() => setDrawingTool("eraser")}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                          drawingTool === "eraser" 
                            ? "bg-gold-500 text-navy-950" 
                            : "hover:bg-white/10 text-white"
                        }`}
                        title="Eraser Tool"
                      >
                        <Eraser className="w-4 h-4" />
                        <span>Eraser</span>
                      </button>

                      <button
                        onClick={() => setDrawingTool("text")}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                          drawingTool === "text" 
                            ? "bg-gold-500 text-navy-950" 
                            : "hover:bg-white/10 text-white"
                        }`}
                        title="Click Image to Add Text Notes"
                      >
                        <Type className="w-4 h-4" />
                        <span>Text Note</span>
                      </button>
                    </div>

                    {/* Brush Controls (only show if draw is active) */}
                    {drawingTool === "draw" && (
                      <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                        {/* Colors palette */}
                        <div className="flex items-center gap-1.5">
                          {["#ef4444", "#facc15", "#22c55e", "#2563eb", "#ffffff", "#000000"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setBrushColor(color)}
                              style={{ backgroundColor: color }}
                              className={`w-5 h-5 rounded-full border cursor-pointer transition-transform ${
                                brushColor === color 
                                  ? "border-gold-400 scale-125 ring-2 ring-gold-400/50" 
                                  : "border-white/25 hover:scale-110"
                              }`}
                              title={color}
                            />
                          ))}
                        </div>
                        
                        {/* Brush Size Slider */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white/60">Size:</span>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-20 accent-gold-500 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono text-white/80 w-4">{brushSize}px</span>
                        </div>
                      </div>
                    )}

                    {/* Global Actions (Undo, Clear, Save) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUndo}
                        disabled={undoStack.length === 0}
                        className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-40 disabled:hover:bg-transparent transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Undo Stroke"
                      >
                        <Undo className="w-4 h-4" />
                        <span>Undo</span>
                      </button>

                      <button
                        onClick={handleClearAnnotations}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Clear All Drawings & Notes"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                      </button>

                      <button
                        onClick={handleSaveAnnotations}
                        className="px-3.5 py-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-navy-950 text-xs font-black rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Annotations</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Filmstrip Carousel */}
            {filteredItems.length > 1 && (
              <div className="px-4 py-2 bg-black/80 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto max-w-full z-20 shrink-0">
                {filteredItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setZoomLevel(1);
                    }}
                    className={`relative w-12 h-9 rounded-md overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      idx === lightboxIndex
                        ? "border-gold-400 scale-105 ring-2 ring-gold-400/50 shadow-md opacity-100"
                        : "border-white/20 hover:border-white/50 opacity-50 hover:opacity-100"
                    }`}
                    title={item.title}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-navy-950 flex items-center justify-center text-white">
                        <Video className="w-3 h-3" />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Details Track */}
            <div className="p-4 bg-gradient-to-t from-black/95 to-black/60 text-center select-none text-white max-w-3xl mx-auto w-full space-y-2 z-20 shrink-0">
              
              {captionSaveSuccess && (
                <div className="py-1 px-3 bg-emerald-500/90 text-white rounded-full text-[11px] font-bold shadow-lg inline-flex items-center gap-1.5 animate-pulse">
                  <Check className="w-3.5 h-3.5" />
                  <span>{captionSaveSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 line-clamp-1 text-left">
                  <h3 className="text-sm sm:text-base font-black text-white line-clamp-1">
                    {filteredItems[lightboxIndex].title}
                  </h3>
                  {filteredItems[lightboxIndex].isFavorite && (
                    <Star className="w-4 h-4 text-gold-400 fill-gold-400 shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(filteredItems[lightboxIndex].id, e)}
                    className={`px-2.5 py-1 font-extrabold text-[10px] rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer ${
                      filteredItems[lightboxIndex].isFavorite
                        ? "bg-gold-500 text-navy-950 hover:bg-gold-400"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                    title={filteredItems[lightboxIndex].isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Star className={`w-3 h-3 ${filteredItems[lightboxIndex].isFavorite ? "fill-navy-950 text-navy-950" : "text-gold-400"}`} />
                    <span>{filteredItems[lightboxIndex].isFavorite ? "Favorited" : "Favorite"}</span>
                  </button>

                  {canManageGallery && (
                    <button
                      type="button"
                      onClick={() => {
                        const current = filteredItems[lightboxIndex];
                        if (editingCaptionId === current.id) {
                          setEditingCaptionId(null);
                        } else {
                          setEditingCaptionId(current.id);
                          setEditCategoryValue(current.category || "Classroom");
                          setEditAltTextValue(current.altText || current.title || "");
                          setEditCaptionValue(current.caption || "");
                          setEditTagsValue(current.tags || []);
                          setNewEditTagInput("");
                        }
                      }}
                      className="px-2.5 py-1 bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold text-[10px] rounded-lg shadow-sm transition flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Edit Accessibility Alt Text, Photo Caption, Category & Tags"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{editingCaptionId === filteredItems[lightboxIndex].id ? "Close Editor" : "Edit Photo Details & Tags"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Caption / Alt Text / Category / Tags Editor Form */}
              {editingCaptionId === filteredItems[lightboxIndex].id ? (
                <div className="p-3 bg-navy-950/95 border border-gold-500/50 rounded-xl text-left space-y-2.5 my-2 shadow-2xl max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-wider block">
                        Assign Category
                      </label>
                      <select
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-black/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-gold-500 font-sans cursor-pointer"
                      >
                        {CATEGORIES.filter(c => c !== "All").map(cat => (
                          <option key={cat} value={cat} className="bg-navy-950 text-white font-sans">{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-wider block">
                        Accessibility Alt Text
                      </label>
                      <input
                        type="text"
                        value={editAltTextValue}
                        onChange={(e) => setEditAltTextValue(e.target.value)}
                        placeholder="e.g. Photo of Grade 12 math student solving calculus..."
                        className="w-full px-2.5 py-1.5 text-xs bg-black/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-gold-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-wider block">
                      Photo Caption / Context Note
                    </label>
                    <textarea
                      rows={2}
                      value={editCaptionValue}
                      onChange={(e) => setEditCaptionValue(e.target.value)}
                      placeholder="e.g. Step-by-step differentiation review session held at Pretoria learning suite."
                      className="w-full px-2.5 py-1.5 text-xs bg-black/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-gold-500 font-sans resize-none"
                    />
                  </div>

                  {/* Tag & Label Manager inside Lightbox Form */}
                  <div className="space-y-2 p-2.5 bg-black/40 border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Descriptive Tags & Labels</span>
                      </label>
                      <span className="text-[9px] font-mono text-white/50">{editTagsValue.length} tag(s) assigned</span>
                    </div>

                    {/* Active Tags */}
                    {editTagsValue.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {editTagsValue.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => setEditTagsValue(editTagsValue.filter(t => t !== tag))}
                              className="hover:text-red-400 transition"
                              title={`Remove tag ${tag}`}
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-white/40 italic">No tags assigned yet. Select presets or type custom tags below.</p>
                    )}

                    {/* Quick Preset Toggles */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[9px] font-mono font-bold text-white/60 block">Quick Subject/Topic Presets:</span>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_TAGS.map(preset => {
                          const isSelected = editTagsValue.includes(preset);
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setEditTagsValue(editTagsValue.filter(t => t !== preset));
                                } else {
                                  setEditTagsValue([...editTagsValue, preset]);
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition cursor-pointer ${
                                isSelected
                                  ? "bg-sky-500 text-black font-extrabold"
                                  : "bg-white/10 hover:bg-white/20 text-white/80"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "}{preset}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Tag Input */}
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newEditTagInput}
                        onChange={(e) => setNewEditTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const trimmed = newEditTagInput.trim();
                            if (trimmed && !editTagsValue.includes(trimmed)) {
                              setEditTagsValue([...editTagsValue, trimmed]);
                              setNewEditTagInput("");
                            }
                          }
                        }}
                        placeholder="Type custom tag (e.g. NSC, Past Paper, Calculus Proof) and hit Enter"
                        className="flex-1 px-2.5 py-1 text-xs bg-black/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sky-400 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newEditTagInput.trim();
                          if (trimmed && !editTagsValue.includes(trimmed)) {
                            setEditTagsValue([...editTagsValue, trimmed]);
                            setNewEditTagInput("");
                          }
                        }}
                        className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-[10px] rounded-lg cursor-pointer shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingCaptionId(null)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[11px] font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveCaptionAndAltText(filteredItems[lightboxIndex].id)}
                      className="px-3.5 py-1 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black rounded-md text-[11px] cursor-pointer flex items-center gap-1 shadow"
                    >
                      <Check className="w-3 h-3" /> Save All Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-white/70 leading-relaxed max-w-xl mx-auto line-clamp-2">
                    {filteredItems[lightboxIndex].description}
                  </p>

                  {/* Caption & Alt Text Badges */}
                  {(filteredItems[lightboxIndex].caption || filteredItems[lightboxIndex].altText) && (
                    <div className="max-w-xl mx-auto space-y-1 pt-1 text-left">
                      {filteredItems[lightboxIndex].caption && (
                        <div className="p-2 bg-white/10 border border-white/10 rounded-lg text-xs text-gold-300 italic flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>Caption:</strong> {filteredItems[lightboxIndex].caption}</span>
                        </div>
                      )}
                      
                      {filteredItems[lightboxIndex].altText && (
                        <div className="text-[10px] text-white/60 font-mono flex items-center gap-1.5 pl-1">
                          <span className="px-1.5 py-0.2 bg-royal-600/60 text-white rounded font-bold uppercase tracking-wider text-[8px]">
                            Alt Text
                          </span>
                          <span className="truncate">{filteredItems[lightboxIndex].altText}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Display Lightbox Item Tags */}
              {filteredItems[lightboxIndex].tags && filteredItems[lightboxIndex].tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 pt-0.5">
                  {filteredItems[lightboxIndex].tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white text-[9px] font-mono font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Keyboard Shortcuts Hint */}
              <p className="text-[10px] text-white/40 font-mono pt-1 hidden sm:block">
                Shortcuts: <span className="text-gold-400 font-bold">← / →</span> Navigate • <span className="text-gold-400 font-bold">Double Click</span> 2x Zoom • <span className="text-gold-400 font-bold">+ / -</span> Zoom • <span className="text-gold-400 font-bold">F</span> Fullscreen • <span className="text-gold-400 font-bold">Esc</span> Close
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* CAMERA CAPTURE MODAL */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-left space-y-6 overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-navy-150 dark:border-navy-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-royal-100 dark:bg-royal-950 text-royal-600 dark:text-royal-400 rounded-lg">
                    <Camera className="w-4 h-4 animate-pulse" />
                  </div>
                  <h3 className="text-base font-black text-navy-900 dark:text-white">
                    Capture New Photo with Camera
                  </h3>
                </div>
                <button
                  onClick={() => setShowCameraModal(false)}
                  className="p-1 text-navy-400 hover:text-navy-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cameraError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400">
                  ⚠️ {cameraError}
                </div>
              )}

              {/* Camera Display View */}
              <div className="space-y-4">
                {!capturedImage ? (
                  <div className="relative aspect-[4/3] w-full bg-black rounded-xl overflow-hidden border border-navy-200 dark:border-navy-800 flex items-center justify-center">
                    {cameraStream ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="text-center text-navy-400 text-xs flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>Initializing stream...</span>
                      </div>
                    )}
                    {cameraStream && (
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-royal-600 text-white hover:bg-royal-700 font-extrabold text-xs rounded-full shadow-lg border border-white/20 transition-all flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Snapshot</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative aspect-[4/3] w-full bg-navy-100 dark:bg-navy-950 rounded-xl overflow-hidden border border-navy-200 dark:border-navy-850">
                      <img
                        src={capturedImage}
                        alt="Captured frame"
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      <button
                        type="button"
                        onClick={startCamera}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-navy-900/80 text-white hover:bg-navy-900 text-xs font-bold rounded-full border border-navy-750 transition flex items-center gap-2 shadow"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake Photo</span>
                      </button>
                      
                      {capturedImage && (
                        <button
                          type="button"
                          onClick={() => openCropper(capturedImage, "camera")}
                          className="absolute top-4 right-4 px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black rounded-full shadow-lg transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>Crop Photo</span>
                        </button>
                      )}
                    </div>

                    {/* Metadata input form after snapshot is taken */}
                    <form onSubmit={handleSaveCameraPhoto} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                          Photo Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={cameraTitle}
                          onChange={(e) => setCameraTitle(e.target.value)}
                          placeholder="e.g. My Study Notes Snapshot"
                          className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                          Category *
                        </label>
                        <select
                          value={cameraCategory}
                          onChange={(e) => setCameraCategory(e.target.value as GalleryItem["category"])}
                          className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
                        >
                          <option value="Classroom">Classroom</option>
                          <option value="Events">Events</option>
                          <option value="Worksheets">Worksheets</option>
                          <option value="Digital Whiteboards">Digital Whiteboards</option>
                          <option value="Study Materials">Study Materials</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                          Description *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={cameraDesc}
                          onChange={(e) => setCameraDesc(e.target.value)}
                          placeholder="What is depicted in this photograph?"
                          className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white resize-none"
                        />
                      </div>

                      {/* Caption & Alt Text Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                            Accessibility Alt Text
                          </label>
                          <input
                            type="text"
                            value={cameraAltText}
                            onChange={(e) => setCameraAltText(e.target.value)}
                            placeholder="Screen reader image description..."
                            className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                            Photo Caption
                          </label>
                          <input
                            type="text"
                            value={cameraCaption}
                            onChange={(e) => setCameraCaption(e.target.value)}
                            placeholder="Brief caption or study note..."
                            className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Topic Tagging System */}
                      <div className="space-y-2 border-t border-navy-100 dark:border-navy-800/60 pt-3">
                        <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          Topic Tags / Subjects
                        </label>
                        <p className="text-[10px] text-navy-400 dark:text-navy-500 leading-normal">
                          Select standard math topics or type custom tags to categorize your study materials.
                        </p>
                        
                        {/* Preset Tags Grid */}
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_TAGS.map((tag) => {
                            const isSelected = cameraSelectedTags.includes(tag);
                            return (
                              <button
                                type="button"
                                key={tag}
                                onClick={() => {
                                  setCameraSelectedTags(prev =>
                                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                  );
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-gold-500 text-navy-950 font-bold shadow-sm"
                                    : "bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-300 border border-navy-150 dark:border-navy-800"
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Tags Section */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCameraCustomTag}
                              onChange={(e) => setNewCameraCustomTag(e.target.value)}
                              placeholder="e.g. Quadratic Formula"
                              className="flex-1 px-3 py-1.5 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-600 text-navy-800 dark:text-white"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const trimmed = newCameraCustomTag.trim();
                                  if (trimmed && !cameraCustomTags.includes(trimmed)) {
                                    setCameraCustomTags(prev => [...prev, trimmed]);
                                    setNewCameraCustomTag("");
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const trimmed = newCameraCustomTag.trim();
                                if (trimmed && !cameraCustomTags.includes(trimmed)) {
                                  setCameraCustomTags(prev => [...prev, trimmed]);
                                  setNewCameraCustomTag("");
                                }
                              }}
                              className="px-3 py-1.5 bg-navy-100 dark:bg-navy-850 hover:bg-royal-600 hover:text-white text-navy-800 dark:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer border border-navy-200 dark:border-navy-750"
                            >
                              Add
                            </button>
                          </div>

                          {/* Display custom tags added */}
                          {cameraCustomTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {cameraCustomTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-royal-50 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 border border-royal-100 dark:border-royal-900 text-[10px] font-medium"
                                >
                                  <span>#{tag}</span>
                                  <button
                                    type="button"
                                    onClick={() => setCameraCustomTags(prev => prev.filter(t => t !== tag))}
                                    className="hover:text-red-500 font-extrabold focus:outline-none ml-0.5 text-[9px] cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modal Footer Controls */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-navy-150 dark:border-navy-800 mt-6">
                        <button
                          type="button"
                          onClick={() => { setShowCameraModal(false); stopCamera(); }}
                          className="px-4 py-2 border border-navy-250 dark:border-navy-750 text-navy-700 dark:text-navy-300 rounded-lg text-xs font-bold hover:bg-navy-50 dark:hover:bg-navy-850 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-xs font-extrabold shadow-sm hover:shadow-md transition cursor-pointer"
                        >
                          Add Captured Photo
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-850 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-left space-y-6 overflow-y-auto max-h-[90vh]"
            >
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-navy-150 dark:border-navy-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gold-100 dark:bg-gold-950/30 text-gold-600 dark:text-gold-400 rounded-lg">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-navy-900 dark:text-white">
                    Upload Your Media Photos & Videos
                  </h3>
                </div>
                <button
                  onClick={() => { setShowUploadModal(false); setUploadError(""); }}
                  className="p-1 text-navy-400 hover:text-navy-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                    Media Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Matric Trigonometry Class"
                    className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
                  />
                </div>

                {/* Category & Type Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                      Category *
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as GalleryItem["category"])}
                      className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
                    >
                      <option value="Classroom">Classroom</option>
                      <option value="Events">Events</option>
                      <option value="Worksheets">Worksheets</option>
                      <option value="Digital Whiteboards">Digital Whiteboards</option>
                      <option value="Study Materials">Study Materials</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                      Media Type
                    </label>
                    <div className="py-2.5 px-3 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg text-xs font-mono text-navy-600 dark:text-navy-400">
                      Auto-detected based on file
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="Provide context or a brief explanation of this photo/video."
                    className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white resize-none"
                  />
                </div>

                {/* Caption & Alt Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                      Accessibility Alt Text
                    </label>
                    <input
                      type="text"
                      value={uploadAltText}
                      onChange={(e) => setUploadAltText(e.target.value)}
                      placeholder="Screen reader image description..."
                      className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                      Photo Caption
                    </label>
                    <input
                      type="text"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="Brief caption or study note..."
                      className="w-full px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-600 text-navy-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Topic Tagging System */}
                <div className="space-y-2 border-t border-navy-100 dark:border-navy-800/60 pt-3">
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Topic Tags / Subjects
                  </label>
                  <p className="text-[10px] text-navy-400 dark:text-navy-500 leading-normal">
                    Select standard math topics or type custom tags to categorize your study materials.
                  </p>
                  
                  {/* Preset Tags Grid */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.map((tag) => {
                      const isSelected = uploadSelectedTags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => {
                            setUploadSelectedTags(prev =>
                              prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                            );
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-gold-500 text-navy-950 font-bold shadow-sm"
                              : "bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-300 border border-navy-150 dark:border-navy-800"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Tags Section */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newUploadCustomTag}
                        onChange={(e) => setNewUploadCustomTag(e.target.value)}
                        placeholder="e.g. Past Paper 1"
                        className="flex-1 px-3 py-1.5 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-600 text-navy-800 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const trimmed = newUploadCustomTag.trim();
                            if (trimmed && !uploadCustomTags.includes(trimmed)) {
                              setUploadCustomTags(prev => [...prev, trimmed]);
                              setNewUploadCustomTag("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newUploadCustomTag.trim();
                          if (trimmed && !uploadCustomTags.includes(trimmed)) {
                            setUploadCustomTags(prev => [...prev, trimmed]);
                            setNewUploadCustomTag("");
                          }
                        }}
                        className="px-3 py-1.5 bg-navy-100 dark:bg-navy-850 hover:bg-royal-600 hover:text-white text-navy-800 dark:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer border border-navy-200 dark:border-navy-750"
                      >
                        Add
                      </button>
                    </div>

                    {/* Display custom tags added */}
                    {uploadCustomTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {uploadCustomTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-royal-50 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 border border-royal-100 dark:border-royal-900 text-[10px] font-medium"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => setUploadCustomTags(prev => prev.filter(t => t !== tag))}
                              className="hover:text-red-500 font-extrabold focus:outline-none ml-0.5 text-[9px] cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload Drag and Drop Zone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-navy-700 dark:text-navy-200 uppercase tracking-wider block font-mono">
                      Select Files (Upload 1 or 100+ Photos at once) *
                    </label>
                    <span className="text-[10px] font-mono text-gold-600 dark:text-gold-400 font-bold bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">
                      Multi-Select 100+ Enabled
                    </span>
                  </div>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 select-none ${
                      dragActive 
                        ? "border-royal-600 bg-royal-600/5" 
                        : "border-navy-300 dark:border-navy-800 hover:border-royal-500 hover:bg-navy-50 dark:hover:bg-navy-950"
                    }`}
                  >
                    {isProcessingBatch && batchProgress ? (
                      <div className="space-y-3 w-full py-4">
                        <div className="flex items-center justify-center gap-2 text-royal-600 dark:text-royal-400 font-bold text-xs">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Optimizing & Processing Photos ({batchProgress.current} / {batchProgress.total})</span>
                        </div>
                        <div className="w-full bg-navy-150 dark:bg-navy-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-gold-500 to-royal-600 h-full transition-all duration-200 rounded-full"
                            style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-mono text-navy-400">
                          {Math.round((batchProgress.current / batchProgress.total) * 100)}% complete — Please wait while 100+ images are prepared.
                        </p>
                      </div>
                    ) : batchFiles.length > 1 ? (
                      <div className="space-y-3 w-full">
                        <div className="p-4 bg-royal-50 dark:bg-royal-950/40 border border-royal-200 dark:border-royal-800/60 rounded-xl text-center space-y-2">
                          <div className="flex items-center justify-center gap-2 text-royal-700 dark:text-royal-300 font-extrabold text-sm">
                            <Folder className="w-5 h-5 text-gold-500" />
                            <span>{batchFiles.length} Photos / Files Staged</span>
                          </div>
                          <p className="text-[11px] text-navy-600 dark:text-navy-300 leading-normal">
                            You have selected <b>{batchFiles.length} items</b> for bulk upload. Clicking "Add to Gallery" will compress, title, and add all {batchFiles.length} photos at once!
                          </p>
                          <button
                            type="button"
                            onClick={() => { setBatchFiles([]); setUploadFileBase64(""); }}
                            className="px-3 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold border border-red-500/20 cursor-pointer"
                          >
                            Clear Selection ({batchFiles.length})
                          </button>
                        </div>
                      </div>
                    ) : uploadFileBase64 ? (
                      <div className="space-y-3 w-full">
                        <div className="h-28 max-w-xs mx-auto rounded-lg overflow-hidden border border-navy-200 dark:border-navy-850 bg-navy-100 flex items-center justify-center relative">
                          {uploadType === "video" ? (
                            <div className="flex flex-col items-center gap-1 text-navy-600 dark:text-navy-400">
                              <Video className="w-8 h-8" />
                              <span className="text-[10px] font-mono">Video loaded</span>
                            </div>
                          ) : (
                            <img 
                              src={uploadFileBase64} 
                              alt="Upload preview" 
                              className="w-full h-full object-cover" 
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => { setUploadFileBase64(""); setBatchFiles([]); }}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow animate-bounce"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {uploadType === "image" && (
                          <button
                            type="button"
                            onClick={() => openCropper(uploadFileBase64, "upload")}
                            className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 mx-auto transition"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span>Crop / Normalize Aspect Ratio</span>
                          </button>
                        )}
                        <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ File loaded and ready to add!
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-navy-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-xs font-bold text-navy-800 dark:text-white">
                            Drag & drop your files or photos here
                          </p>
                          <p className="text-[10px] text-navy-400 mt-0.5">
                            Select up to 100+ photos at once (.png, .jpg, .webp, .mp4)
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-navy-400 uppercase">OR</span>
                        <label className="px-4 py-2 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-sm flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Browse Files (Select 100+ Photos)</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileInput}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {uploadError && (
                  <p className="text-[10px] font-mono text-red-600 dark:text-red-400 font-bold">
                    ⚠️ {uploadError}
                  </p>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-navy-150 dark:border-navy-800 mt-6">
                  <button
                    type="button"
                    disabled={isProcessingBatch}
                    onClick={() => { setShowUploadModal(false); setUploadError(""); setBatchFiles([]); }}
                    className="px-4 py-2 border border-navy-250 dark:border-navy-750 text-navy-700 dark:text-navy-300 rounded-lg text-xs font-bold hover:bg-navy-50 dark:hover:bg-navy-850 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingBatch}
                    className="px-5 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-xs font-extrabold shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingBatch ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading Batch...</span>
                      </>
                    ) : batchFiles.length > 1 ? (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload All {batchFiles.length} Photos</span>
                      </>
                    ) : (
                      <span>Add to Gallery</span>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmModal({ isOpen: false, type: "single" })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${
                  deleteConfirmModal.type === "restore" 
                    ? "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                    : "bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800"
                }`}>
                  {deleteConfirmModal.type === "restore" ? (
                    <RotateCcw className="w-6 h-6" />
                  ) : (
                    <Trash2 className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-extrabold text-navy-950 dark:text-white font-display">
                    {deleteConfirmModal.type === "restore"
                      ? "Restore Default Showcase Photos?"
                      : deleteConfirmModal.type === "bulk"
                      ? `Delete ${deleteConfirmModal.targetIds?.length || 0} Selected Photos?`
                      : "Delete Photo from Gallery?"}
                  </h3>
                  <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
                    {deleteConfirmModal.type === "restore"
                      ? "This will restore all default showcase photos back to the media gallery. Your custom uploaded photos will remain."
                      : deleteConfirmModal.type === "bulk"
                      ? `Are you sure you want to remove ${deleteConfirmModal.targetIds?.length || 0} photo(s) from your active gallery view?`
                      : `Are you sure you want to remove "${deleteConfirmModal.targetTitle || "this photo"}" from your gallery view?`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-navy-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, type: "single" })}
                  className="px-4 py-2 bg-navy-100 hover:bg-navy-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-800 dark:text-navy-200 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmExecuteDelete}
                  className={`px-5 py-2 text-white text-xs font-black rounded-lg shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                    deleteConfirmModal.type === "restore"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleteConfirmModal.type === "restore" ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Photos</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTO-PLAY SLIDESHOW MODAL OVERLAY */}
      <AnimatePresence>
        {isSlideshowActive && (() => {
          const activeSlideshowItems = slideshowCategory === "All"
            ? items
            : items.filter(i => i.category === slideshowCategory || i.category.includes(slideshowCategory));
          
          const currentSlide = activeSlideshowItems[slideshowIndex % (activeSlideshowItems.length || 1)];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
            >
              {/* Slideshow Top Header */}
              <div className="flex items-center justify-between gap-4 z-20 bg-black/40 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Auto-Play Slideshow</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                        {activeSlideshowItems.length} Photos
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/60 font-mono">
                      Rotating category images automatically
                    </p>
                  </div>
                </div>

                {/* Category & Speed Controls */}
                <div className="flex items-center gap-3">
                  {/* Category Filter Dropdown */}
                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] font-mono text-white/60 font-bold uppercase">Category:</span>
                    <select
                      value={slideshowCategory}
                      onChange={(e) => {
                        setSlideshowCategory(e.target.value);
                        setSlideshowIndex(0);
                      }}
                      className="bg-transparent text-white font-extrabold text-xs focus:outline-none cursor-pointer border-none"
                    >
                      <option value="All" className="bg-navy-950 text-white">All Categories ({items.length})</option>
                      {CATEGORIES.filter(c => c !== "All").map(cat => (
                        <option key={cat} value={cat} className="bg-navy-950 text-white">{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Interval Speed Selector */}
                  <div className="hidden sm:flex items-center gap-1 bg-white/10 border border-white/15 p-1 rounded-xl">
                    {[2000, 4000, 6000, 10000].map((ms) => (
                      <button
                        key={ms}
                        onClick={() => setSlideshowIntervalMs(ms)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          slideshowIntervalMs === ms
                            ? "bg-gold-500 text-navy-950 shadow font-extrabold"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {ms / 1000}s
                      </button>
                    ))}
                  </div>

                  {/* Play / Pause Toggle */}
                  <button
                    onClick={() => setSlideshowIsPlaying(!slideshowIsPlaying)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title={slideshowIsPlaying ? "Pause slideshow" : "Play slideshow"}
                  >
                    {slideshowIsPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span className="hidden md:inline">{slideshowIsPlaying ? "Pause" : "Play"}</span>
                  </button>

                  {/* Exit Slideshow */}
                  <button
                    onClick={() => setIsSlideshowActive(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                    title="Close Slideshow"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Center Slideshow Stage */}
              {activeSlideshowItems.length === 0 ? (
                <div className="my-auto text-center space-y-3 text-white">
                  <p className="text-sm font-bold">No photos found in category "{slideshowCategory}".</p>
                  <button
                    onClick={() => setSlideshowCategory("All")}
                    className="px-4 py-2 bg-gold-500 text-navy-950 font-bold text-xs rounded-xl"
                  >
                    Switch to All Categories
                  </button>
                </div>
              ) : (
                <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden group">
                  {/* Progress Line */}
                  {slideshowIsPlaying && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
                      <motion.div
                        key={`progress-${slideshowIndex}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: slideshowIntervalMs / 1000, ease: "linear" }}
                        className="h-full bg-emerald-400 shadow-sm"
                      />
                    </div>
                  )}

                  {/* Prev Slide Button */}
                  <button
                    onClick={() => setSlideshowIndex(prev => (prev - 1 + activeSlideshowItems.length) % activeSlideshowItems.length)}
                    className="absolute left-4 z-30 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full border border-white/20 backdrop-blur-sm opacity-60 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Current Photo Render */}
                  <AnimatePresence mode="wait">
                    {currentSlide && (
                      <motion.div
                        key={currentSlide.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.04 }}
                        transition={{ duration: 0.5 }}
                        className="relative max-h-[75vh] max-w-5xl w-full flex items-center justify-center rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-navy-950/80"
                      >
                        {currentSlide.type === "video" ? (
                          <video
                            src={currentSlide.url}
                            controls
                            autoPlay
                            muted
                            className="max-h-[70vh] w-auto object-contain rounded-xl"
                          />
                        ) : (
                          <img
                            src={currentSlide.url}
                            alt={currentSlide.altText || currentSlide.title}
                            className="max-h-[70vh] w-auto object-contain rounded-xl"
                          />
                        )}

                        {/* Category badge overlay */}
                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-gold-400 border border-gold-500/30 text-xs font-mono font-bold rounded-lg uppercase tracking-wider">
                          {currentSlide.category}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Next Slide Button */}
                  <button
                    onClick={() => setSlideshowIndex(prev => (prev + 1) % activeSlideshowItems.length)}
                    className="absolute right-4 z-30 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full border border-white/20 backdrop-blur-sm opacity-60 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Bottom Details Footer */}
              {currentSlide && (
                <div className="bg-black/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md max-w-4xl mx-auto w-full text-center space-y-1 z-20">
                  <h4 className="text-base font-extrabold text-white">{currentSlide.title}</h4>
                  <p className="text-xs text-white/70 max-w-2xl mx-auto">{currentSlide.description}</p>
                  {currentSlide.caption && (
                    <p className="text-xs text-gold-400 font-serif italic pt-1">
                      "{currentSlide.caption}"
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* IMAGE CROPPER MODAL OVERLAY */}
      <AnimatePresence>
        {cropModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[125] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-navy-150 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gold-100 dark:bg-gold-950/40 text-gold-600 dark:text-gold-400 rounded-xl">
                    <Crop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-navy-900 dark:text-white">
                      Image Aspect Ratio & Crop Tool
                    </h3>
                    <p className="text-[11px] text-navy-500 dark:text-navy-400 font-mono">
                      Normalize photo framing for uniform gallery presentation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCropModalOpen(false)}
                  className="p-1.5 text-navy-400 hover:text-navy-600 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Crop Aspect Ratio Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-navy-500 dark:text-navy-400 block">
                  1. Choose Aspect Ratio Preset:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: "4:3", label: "4:3 Standard" },
                    { id: "16:9", label: "16:9 Wide" },
                    { id: "1:1", label: "1:1 Square" },
                    { id: "3:2", label: "3:2 Classic" },
                    { id: "free", label: "Free" },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setCropAspectRatio(preset.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold transition cursor-pointer border text-center ${
                        cropAspectRatio === preset.id
                          ? "bg-gold-500 text-navy-950 border-gold-600 font-black shadow-sm"
                          : "bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-800 hover:border-gold-400"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Canvas Preview Box */}
              <div className="relative w-full aspect-[4/3] bg-navy-950 rounded-xl overflow-hidden border border-navy-800 flex items-center justify-center p-2">
                <div 
                  className="relative overflow-hidden rounded border border-gold-400/50 shadow-2xl flex items-center justify-center"
                  style={{
                    aspectRatio: cropAspectRatio === "1:1" ? "1/1" : cropAspectRatio === "16:9" ? "16/9" : cropAspectRatio === "3:2" ? "3/2" : "4/3",
                    maxWidth: "100%",
                    maxHeight: "100%"
                  }}
                >
                  <img
                    src={cropImageSrc}
                    alt="Crop preview"
                    className="w-full h-full object-cover transition-transform duration-100 select-none"
                    style={{
                      transform: `scale(${cropZoom}) rotate(${cropRotation}deg) translate(${cropOffsetX}px, ${cropOffsetY}px)`
                    }}
                  />
                  {/* Grid overlay lines for rule of thirds */}
                  <div className="absolute inset-0 border border-gold-400/40 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-gold-400/20" />
                    <div className="border-r border-b border-gold-400/20" />
                    <div className="border-b border-gold-400/20" />
                    <div className="border-r border-b border-gold-400/20" />
                    <div className="border-r border-b border-gold-400/20" />
                    <div className="border-b border-gold-400/20" />
                  </div>
                </div>
              </div>

              {/* Crop Fine-Tuning Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-navy-50 dark:bg-navy-950 p-3.5 rounded-xl border border-navy-150 dark:border-navy-850 text-xs">
                {/* Zoom Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono font-bold text-[10px] text-navy-600 dark:text-navy-300">
                    <span>Zoom Level:</span>
                    <span>{cropZoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer h-1.5 bg-navy-200 dark:bg-navy-800 rounded-lg appearance-none"
                  />
                </div>

                {/* Rotation Button */}
                <div className="space-y-1 flex flex-col justify-center">
                  <span className="font-mono font-bold text-[10px] text-navy-600 dark:text-navy-300">
                    Rotation Angle: {cropRotation}°
                  </span>
                  <button
                    type="button"
                    onClick={() => setCropRotation((prev) => (prev + 90) % 360)}
                    className="px-3 py-1 bg-white dark:bg-navy-850 hover:bg-navy-100 text-navy-800 dark:text-navy-200 border border-navy-200 dark:border-navy-750 font-extrabold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-gold-500" />
                    <span>Rotate 90°</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-navy-150 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="px-4 py-2 border border-navy-250 dark:border-navy-750 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold hover:bg-navy-50 dark:hover:bg-navy-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="px-5 py-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-navy-950 rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Crop & Save</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAG & LABEL MANAGER MODAL */}
      <AnimatePresence>
        {editingTagsModalId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            {(() => {
              const targetItem = items.find(i => i.id === editingTagsModalId);
              if (!targetItem) return null;

              return (
                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left"
                >
                  <div className="flex items-center justify-between border-b border-navy-150 dark:border-navy-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl border border-sky-200 dark:border-sky-800">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                          Manage Photo Tags & Labels
                        </h3>
                        <p className="text-xs text-navy-500 dark:text-navy-400">
                          Add searchable subject, grade, or topic tags to this photo
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingTagsModalId(null)}
                      className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-lg text-navy-500 dark:text-navy-400 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Photo Thumbnail Preview & Info */}
                  <div className="p-3 bg-navy-50 dark:bg-navy-950 border border-navy-150 dark:border-navy-800 rounded-xl flex items-center gap-3">
                    <img
                      src={targetItem.url}
                      alt={targetItem.title}
                      className="w-16 h-12 object-cover rounded-lg border border-navy-200 dark:border-navy-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-navy-900 dark:text-white truncate">
                        {targetItem.title}
                      </h4>
                      <p className="text-[10px] text-navy-500 dark:text-navy-400 truncate">
                        Category: <span className="font-mono font-bold text-gold-500">{targetItem.category}</span>
                      </p>
                    </div>
                  </div>

                  {/* Active Assigned Tags */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-navy-800 dark:text-navy-200 uppercase tracking-wider block">
                      Active Assigned Tags ({editTagsValue.length}):
                    </label>
                    {editTagsValue.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-navy-50/80 dark:bg-navy-950/80 border border-navy-150 dark:border-navy-800 rounded-xl max-h-28 overflow-y-auto">
                        {editTagsValue.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 shadow-sm"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => setEditTagsValue(editTagsValue.filter(t => t !== tag))}
                              className="text-navy-400 hover:text-red-500 transition cursor-pointer"
                              title={`Remove tag ${tag}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="p-3 bg-navy-50/50 dark:bg-navy-950/50 border border-dashed border-navy-200 dark:border-navy-800 rounded-xl text-xs text-navy-400 italic">
                        No tags assigned yet. Select preset subject tags or type custom labels below.
                      </p>
                    )}
                  </div>

                  {/* Quick Preset Tag Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-navy-800 dark:text-navy-200 uppercase tracking-wider block">
                      Quick CAPS/IEB Math Presets:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_TAGS.map(preset => {
                        const isSelected = editTagsValue.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setEditTagsValue(editTagsValue.filter(t => t !== preset));
                              } else {
                                setEditTagsValue([...editTagsValue, preset]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-sky-500 text-black shadow-sm ring-2 ring-sky-400/50"
                                : "bg-navy-100 hover:bg-navy-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-navy-700 dark:text-navy-200"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}{preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Custom Tag Input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-mono font-bold text-navy-800 dark:text-navy-200 uppercase tracking-wider block">
                      Add Custom Label / Tag:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newEditTagInput}
                        onChange={(e) => setNewEditTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const trimmed = newEditTagInput.trim();
                            if (trimmed && !editTagsValue.includes(trimmed)) {
                              setEditTagsValue([...editTagsValue, trimmed]);
                              setNewEditTagInput("");
                            }
                          }
                        }}
                        placeholder="e.g. NSC Exam, Circle Proof, Bethuel Moukangwe..."
                        className="flex-1 px-3 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newEditTagInput.trim();
                          if (trimmed && !editTagsValue.includes(trimmed)) {
                            setEditTagsValue([...editTagsValue, trimmed]);
                            setNewEditTagInput("");
                          }
                        }}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs rounded-xl cursor-pointer shadow transition"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-navy-150 dark:border-navy-800">
                    <button
                      type="button"
                      onClick={() => setEditingTagsModalId(null)}
                      className="px-4 py-2 border border-navy-250 dark:border-navy-750 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold hover:bg-navy-50 dark:hover:bg-navy-850 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveTags(targetItem.id, editTagsValue);
                        setEditingTagsModalId(null);
                      }}
                      className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Tags</span>
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRINT GALLERY MODE MODAL & PRINTABLE SHEET OVERLAY */}
      <AnimatePresence>
        {showPrintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-4 md:p-6"
            id="printable-gallery-sheet-wrapper"
          >
            {/* PRINT CSS STYLES FOR PHYSICAL PAPER PRINTING */}
            <style>{`
              @media print {
                body {
                  background: white !important;
                  color: black !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body > div:not(#printable-gallery-sheet-wrapper),
                #printable-gallery-sheet-wrapper > .no-print,
                nav, header, footer, .no-print {
                  display: none !important;
                }
                #printable-gallery-sheet-wrapper {
                  position: absolute !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  overflow: visible !important;
                  background: white !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  z-index: 999999 !important;
                }
                #printable-gallery-sheet {
                  box-shadow: none !important;
                  border: none !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  padding: 10mm !important;
                  background: white !important;
                  color: black !important;
                  border-radius: 0 !important;
                }
                .print-card-break {
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
                @page {
                  size: ${printPaperSize === "A4" ? "A4 portrait" : "letter portrait"};
                  margin: 10mm;
                }
              }
            `}</style>

            {/* TOP CONTROLS TOOLBAR (NO-PRINT) */}
            <div className="no-print w-full max-w-5xl bg-navy-900 border border-navy-700 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gold-500/20 text-gold-400 rounded-xl">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      Print Gallery Sheet Setup
                      <span className="text-[10px] font-mono bg-royal-600/40 text-royal-200 border border-royal-500/30 px-2 py-0.5 rounded font-bold">
                        Grid Mode
                      </span>
                    </h3>
                    <p className="text-xs text-navy-300">
                      Formats selected math diagrams, whiteboards & photos into a clean paper grid for printing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-950 font-black text-xs rounded-xl shadow-lg hover:shadow-gold-500/20 transition cursor-pointer flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Sheet Now</span>
                  </button>

                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="p-2 bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white rounded-xl transition cursor-pointer"
                    title="Close Print Preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PRINT CONFIGURATION ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                {/* SHEET TITLE INPUT */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-navy-300 block">
                    Document Sheet Header Title:
                  </label>
                  <input
                    type="text"
                    value={printSheetTitle}
                    onChange={(e) => setPrintSheetTitle(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-1.5 text-white focus:border-royal-500 focus:outline-none text-xs"
                    placeholder="Enter sheet title..."
                  />
                </div>

                {/* GRID COLUMNS */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-navy-300 block">
                    Grid Columns:
                  </label>
                  <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-navy-800">
                    {([1, 2, 3, 4] as const).map((cols) => (
                      <button
                        key={cols}
                        onClick={() => setPrintGridCols(cols)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded transition cursor-pointer ${
                          printGridCols === cols
                            ? "bg-royal-600 text-white shadow-sm"
                            : "text-navy-400 hover:text-white"
                        }`}
                      >
                        {cols} {cols === 1 ? "Col" : "Cols"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PAPER SIZE */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-navy-300 block">
                    Paper Standard:
                  </label>
                  <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-navy-800">
                    <button
                      onClick={() => setPrintPaperSize("A4")}
                      className={`flex-1 py-1 text-[11px] font-bold rounded transition cursor-pointer ${
                        printPaperSize === "A4"
                          ? "bg-royal-600 text-white shadow-sm"
                          : "text-navy-400 hover:text-white"
                      }`}
                    >
                      A4
                    </button>
                    <button
                      onClick={() => setPrintPaperSize("Letter")}
                      className={`flex-1 py-1 text-[11px] font-bold rounded transition cursor-pointer ${
                        printPaperSize === "Letter"
                          ? "bg-royal-600 text-white shadow-sm"
                          : "text-navy-400 hover:text-white"
                      }`}
                    >
                      US Letter
                    </button>
                  </div>
                </div>
              </div>

              {/* TOGGLES ROW */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-navy-800/80 text-xs font-mono text-navy-300">
                <span className="text-[10px] uppercase font-bold text-navy-400">Include Options:</span>
                
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={printShowHeader}
                    onChange={(e) => setPrintShowHeader(e.target.checked)}
                    className="rounded border-navy-700 bg-navy-950 text-royal-500"
                  />
                  <span>Header Banner</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={printShowTitles}
                    onChange={(e) => setPrintShowTitles(e.target.checked)}
                    className="rounded border-navy-700 bg-navy-950 text-royal-500"
                  />
                  <span>Photo Titles</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={printShowCaptions}
                    onChange={(e) => setPrintShowCaptions(e.target.checked)}
                    className="rounded border-navy-700 bg-navy-950 text-royal-500"
                  />
                  <span>Captions & Notes</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={printShowTags}
                    onChange={(e) => setPrintShowTags(e.target.checked)}
                    className="rounded border-navy-700 bg-navy-950 text-royal-500"
                  />
                  <span>Topic Tags</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={printShowDates}
                    onChange={(e) => setPrintShowDates(e.target.checked)}
                    className="rounded border-navy-700 bg-navy-950 text-royal-500"
                  />
                  <span>Date Stamp</span>
                </label>

                <span className="ml-auto text-gold-400 font-bold">
                  {printItemIds.length} {printItemIds.length === 1 ? "photo" : "photos"} queued for print
                </span>
              </div>

              {/* QUICK TOGGLE ITEMS THUMBNAILS ROW */}
              <div className="pt-2 border-t border-navy-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-navy-400 uppercase">
                  <span>Toggle Photos Included in Sheet:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPrintItemIds(filteredItems.map(i => i.id))}
                      className="text-royal-400 hover:underline cursor-pointer"
                    >
                      Select All Visible ({filteredItems.length})
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setPrintItemIds([])}
                      className="text-navy-400 hover:text-white cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-h-24 scrollbar-thin">
                  {items.map((item) => {
                    const isQueued = printItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (isQueued) {
                            setPrintItemIds(printItemIds.filter(id => id !== item.id));
                          } else {
                            setPrintItemIds([...printItemIds, item.id]);
                          }
                        }}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition cursor-pointer ${
                          isQueued
                            ? "border-gold-400 ring-2 ring-gold-400/40 opacity-100"
                            : "border-navy-800 opacity-40 hover:opacity-75"
                        }`}
                        title={`${item.title} (${isQueued ? "Included" : "Excluded"})`}
                      >
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        {isQueued && (
                          <div className="absolute top-0.5 right-0.5 bg-gold-500 text-navy-950 rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5 font-bold" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LIVE PRINTABLE PAPER SHEET PREVIEW CONTAINER */}
            <div
              id="printable-gallery-sheet"
              className="w-full max-w-4xl bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl border border-slate-200 transition-all font-sans"
            >
              {/* PRINT HEADER BANNER */}
              {printShowHeader && (
                <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-mono font-black tracking-widest text-royal-700 uppercase">
                      AMARIS MATHEMATICS HUB — NSC CAPS & IEB MATH
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                      {printSheetTitle}
                    </h1>
                    <p className="text-xs text-slate-600 mt-1">
                      Curated visual learning diagrams, homework scans & digital whiteboard notes.
                    </p>
                  </div>

                  <div className="text-right font-mono text-[11px] text-slate-500 flex-shrink-0 border-l sm:border-l-0 sm:pl-0 pl-3 border-slate-200">
                    <div><strong>Date:</strong> {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}</div>
                    <div><strong>Total Items:</strong> {printItemIds.length}</div>
                    <div className="text-[10px] text-slate-400">www.amarismaths.co.za</div>
                  </div>
                </div>
              )}

              {/* GRID OF PRINT ITEMS */}
              {printItemIds.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-300 rounded-2xl">
                  <Printer className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">No photos selected for print sheet.</p>
                  <p className="text-xs text-slate-400 mt-1">Use the toggles above to include photos in your print sheet.</p>
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    printGridCols === 1
                      ? "grid-cols-1"
                      : printGridCols === 2
                      ? "grid-cols-2"
                      : printGridCols === 3
                      ? "grid-cols-3"
                      : "grid-cols-4"
                  }`}
                >
                  {items
                    .filter((item) => printItemIds.includes(item.id))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="print-card-break border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex flex-col space-y-2 shadow-xs"
                      >
                        {/* PHOTO THUMBNAIL */}
                        <div className="relative w-full aspect-4/3 bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
                          <img
                            src={item.url}
                            alt={item.altText || item.title}
                            className="w-full h-full object-cover"
                          />
                          {item.type === "video" && (
                            <div className="absolute top-1 right-1 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Video className="w-2.5 h-2.5" /> Video Frame
                            </div>
                          )}
                        </div>

                        {/* METADATA */}
                        <div className="space-y-1">
                          {printShowTitles && (
                            <h4 className="text-xs font-black text-slate-900 leading-tight">
                              {item.title}
                            </h4>
                          )}

                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                            {printShowDates && item.uploadedAt && (
                              <span className="text-[9px] font-mono text-slate-400">
                                {item.uploadedAt.split(" ")[0]}
                              </span>
                            )}
                          </div>

                          {printShowCaptions && (item.caption || item.description) && (
                            <p className="text-[10px] text-slate-600 leading-snug font-sans pt-0.5 line-clamp-3">
                              {item.caption || item.description}
                            </p>
                          )}

                          {printShowTags && item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[8px] font-mono bg-slate-200/80 text-slate-700 px-1 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* PRINT FOOTER */}
              <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>Amaris Mathematics Hub — South African High School NSC & IEB Mathematics</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
