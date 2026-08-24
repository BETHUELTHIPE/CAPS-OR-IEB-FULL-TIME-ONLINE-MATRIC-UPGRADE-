export interface SubmissionDocumentPage {
  pageNumber: number;
  title: string;
  sectionCode: string;
  marksTotal?: number;
  marksAwarded?: number;
  elements: Array<{
    type: 
      | "coversheet_header"
      | "section_title"
      | "question_block"
      | "student_working"
      | "math_derivation"
      | "diagram"
      | "tutor_annotation"
      | "marking_rubric_table"
      | "scanned_handwriting_mock";
    questionNumber?: string;
    questionText?: string;
    marks?: number;
    awardedMarks?: number;
    isFullyCorrect?: boolean;
    mathSteps?: string[];
    explanation?: string;
    diagramType?: "cast" | "optimization" | "analytical_geom" | "euclidean_circle" | "cubic_graph" | "financial_timeline";
    tutorRemark?: string;
    rubricRows?: Array<{
      criterion: string;
      maxMarks: number;
      awarded: number;
      feedback: string;
    }>;
  }>;
}

/**
 * Generates a full multi-page document structure for any homework submission or vault document.
 * This guarantees the student can preview the entire document (all pages) instead of just page 1.
 */
export function generateSubmissionDocumentPages(
  fileName: string,
  category?: string,
  notes?: string,
  tutorFeedback?: string,
  gradeScore: number = 94,
  isGraded: boolean = false
): SubmissionDocumentPage[] {
  const lowerName = (fileName || "").toLowerCase();
  const lowerCat = (category || "").toLowerCase();

  // Detect primary mathematical topic
  const isCalculus = lowerName.includes("calculus") || lowerName.includes("derivative") || lowerName.includes("principles") || lowerCat.includes("calculus");
  const isTrig = lowerName.includes("trig") || lowerName.includes("cast") || lowerName.includes("angle") || lowerCat.includes("trig");
  const isGeom = lowerName.includes("geom") || lowerName.includes("circle") || lowerName.includes("coordinate") || lowerCat.includes("geom");
  const isFin = lowerName.includes("finan") || lowerName.includes("annuity") || lowerName.includes("loan");

  // PAGE 1: Official Coversheet & Section A (Algebra & Foundation)
  const page1: SubmissionDocumentPage = {
    pageNumber: 1,
    title: "Document Coversheet & Section A: Algebra & Equations",
    sectionCode: "SEC-A",
    marksTotal: 25,
    marksAwarded: 25,
    elements: [
      {
        type: "coversheet_header",
        questionNumber: "NSC / IEB MATHEMATICS PORTFOLIO",
        explanation: `Document: ${fileName} • CAPS Curriculum Standard • Senior Certificate Candidate Script`
      },
      {
        type: "section_title",
        questionNumber: "SECTION A: ALGEBRA, EQUATIONS & EXPONENTS",
        marks: 25
      },
      {
        type: "question_block",
        questionNumber: "1.1",
        questionText: "Solve for x in each of the following equations:",
        marks: 7
      },
      {
        type: "student_working",
        questionNumber: "1.1.1",
        questionText: "2x² - 5x - 12 = 0   [3 Marks]",
        mathSteps: [
          "(2x + 3)(x - 4) = 0",
          "2x + 3 = 0  OR  x - 4 = 0",
          "x = -3/2   OR   x = 4"
        ],
        explanation: "Factorised quadratic trinomial using cross-multiplication method.",
        marks: 3,
        awardedMarks: 3,
        isFullyCorrect: true,
        tutorRemark: "✓ Full method and accurate factor roots shown."
      },
      {
        type: "student_working",
        questionNumber: "1.1.2",
        questionText: "√(2x + 5) - x = 1   [4 Marks]",
        mathSteps: [
          "√(2x + 5) = x + 1",
          "Square both sides: 2x + 5 = (x + 1)²",
          "2x + 5 = x² + 2x + 1",
          "x² - 4 = 0  ==>  (x - 2)(x + 2) = 0  ==>  x = 2  OR  x = -2",
          "Check restrictions: For x = 2: √(4+5) - 2 = 3 - 2 = 1 (Valid)",
          "For x = -2: √(-4+5) - (-2) = 1 + 2 = 3 ≠ 1 (Rejected)",
          "Final Solution: x = 2 only"
        ],
        explanation: "Isolated surd before squaring. Explicitly verified test values against original radical equation.",
        marks: 4,
        awardedMarks: 4,
        isFullyCorrect: true,
        tutorRemark: "✓ Excellent examination technique! Testing extraneous roots prevented mark loss."
      },
      {
        type: "student_working",
        questionNumber: "1.2",
        questionText: "Solve simultaneously for x and y: x + y = 3  and  2x² + xy - y² = 0   [6 Marks]",
        mathSteps: [
          "From linear equation: y = 3 - x  ... (1)",
          "Substitute (1) into quadratic equation:",
          "2x² + x(3 - x) - (3 - x)² = 0",
          "2x² + 3x - x² - (9 - 6x + x²) = 0",
          "x² + 3x - 9 + 6x - x² = 0  ==>  9x - 9 = 0  ==>  x = 1",
          "Substitute x = 1 into (1): y = 3 - (1) = 2",
          "Solution pair: (x = 1, y = 2)"
        ],
        marks: 6,
        awardedMarks: 6,
        isFullyCorrect: true,
        tutorRemark: "✓ Clean algebraic substitution with zero sign errors."
      }
    ]
  };

  // PAGE 2: Section B (Differential Calculus & Rate of Change)
  const page2: SubmissionDocumentPage = {
    pageNumber: 2,
    title: "Section B: Differential Calculus & First Principles",
    sectionCode: "SEC-B",
    marksTotal: 25,
    marksAwarded: 24,
    elements: [
      {
        type: "section_title",
        questionNumber: "SECTION B: DIFFERENTIAL CALCULUS & OPTIMIZATION",
        marks: 25
      },
      {
        type: "student_working",
        questionNumber: "2.1",
        questionText: "Determine f'(x) from first principles if f(x) = 3x² - 4x.   [5 Marks]",
        mathSteps: [
          "f(x + h) = 3(x + h)² - 4(x + h) = 3(x² + 2xh + h²) - 4x - 4h",
          "f(x + h) = 3x² + 6xh + 3h² - 4x - 4h",
          "f(x + h) - f(x) = (3x² + 6xh + 3h² - 4x - 4h) - (3x² - 4x) = 6xh + 3h² - 4h",
          "f'(x) = lim_{h -> 0} [f(x + h) - f(x)] / h",
          "f'(x) = lim_{h -> 0} [h(6x + 3h - 4)] / h",
          "f'(x) = lim_{h -> 0} (6x + 3h - 4)",
          "f'(x) = 6x + 3(0) - 4 = 6x - 4"
        ],
        marks: 5,
        awardedMarks: 5,
        isFullyCorrect: true,
        tutorRemark: "✓ Maintained 'lim h->0' notation on all intermediate lines until final substitution. Perfect 5/5."
      },
      {
        type: "student_working",
        questionNumber: "2.2",
        questionText: "A cubic function is given by g(x) = -x³ + 3x² + 9x - 5. Calculate the coordinates of the turning points and point of inflection.   [8 Marks]",
        mathSteps: [
          "Find derivative: g'(x) = -3x² + 6x + 9",
          "Set g'(x) = 0: -3(x² - 2x - 3) = 0  ==>  -3(x - 3)(x + 1) = 0",
          "Stationary x-values: x = 3  OR  x = -1",
          "For x = 3: g(3) = -(27) + 3(9) + 9(3) - 5 = 22  ==>  Local Maximum at (3, 22)",
          "For x = -1: g(-1) = -(-1) + 3(1) + 9(-1) - 5 = -10  ==>  Local Minimum at (-1, -10)",
          "Second derivative for inflection: g''(x) = -6x + 6",
          "Set g''(x) = 0: -6x + 6 = 0  ==>  x = 1",
          "g(1) = -1 + 3 + 9 - 5 = 6  ==>  Point of Inflection at (1, 6)"
        ],
        marks: 8,
        awardedMarks: 8,
        isFullyCorrect: true,
        tutorRemark: "✓ Clear distinction between local extrema and concavity change at (1, 6)."
      },
      {
        type: "diagram",
        questionNumber: "Visual Rate of Change Modeling",
        diagramType: "optimization",
        explanation: "Fencing constraint perimeter: 2x + y = 24m. Area curve A(x) = 24x - 2x² achieves peak at x = 6m."
      }
    ]
  };

  // PAGE 3: Section C (Trigonometry & CAST Reductions)
  const page3: SubmissionDocumentPage = {
    pageNumber: 3,
    title: "Section C: Trigonometric Identities & General Solutions",
    sectionCode: "SEC-C",
    marksTotal: 25,
    marksAwarded: 23,
    elements: [
      {
        type: "section_title",
        questionNumber: "SECTION C: TRIGONOMETRY REDUCTION & COMPOUND ANGLES",
        marks: 25
      },
      {
        type: "diagram",
        questionNumber: "The CAST Diagram Framework",
        diagramType: "cast",
        explanation: "Quadrant signs: Quadrant I (All +), Quadrant II (Sine +), Quadrant III (Tan +), Quadrant IV (Cos +)."
      },
      {
        type: "student_working",
        questionNumber: "3.1",
        questionText: "Simplify without using a calculator: [sin(180° + x) · cos(90° + x)] / [cos(360° - x) · sin(90° - x) + cos²(180° - x)]   [6 Marks]",
        mathSteps: [
          "Numerator reductions:",
          "sin(180° + x) = -sin x   [Quadrant III]",
          "cos(90° + x) = -sin x   [Co-function switch in Quadrant II]",
          "Numerator = (-sin x)(-sin x) = sin² x",
          "Denominator reductions:",
          "cos(360° - x) = cos x   [Quadrant IV]",
          "sin(90° - x) = cos x   [Quadrant I co-function]",
          "cos²(180° - x) = (-cos x)² = cos² x",
          "Denominator = (cos x)(cos x) + cos² x = 2cos² x",
          "Result = (sin² x) / (2cos² x) = (1/2) tan² x"
        ],
        marks: 6,
        awardedMarks: 6,
        isFullyCorrect: true,
        tutorRemark: "✓ Flawless co-function conversions and squared negative management."
      },
      {
        type: "student_working",
        questionNumber: "3.2",
        questionText: "Prove the identity: [sin 2θ] / [1 + cos 2θ] = tan θ   [4 Marks]",
        mathSteps: [
          "Left Hand Side (LHS) = [sin 2θ] / [1 + cos 2θ]",
          "Apply double angle formulas: sin 2θ = 2sin θ cos θ",
          "Choose cos 2θ = 2cos² θ - 1 to cancel the +1 in denominator:",
          "LHS = [2sin θ cos θ] / [1 + (2cos² θ - 1)] = [2sin θ cos θ] / [2cos² θ]",
          "Cancel common factors (2 and cos θ):",
          "LHS = sin θ / cos θ = tan θ = RHS",
          "Therefore, LHS = RHS (Proven)"
        ],
        marks: 4,
        awardedMarks: 4,
        isFullyCorrect: true,
        tutorRemark: "✓ Selecting '2cos²θ - 1' is the optimal choice to instantly eliminate the 1 in denominator."
      }
    ]
  };

  // PAGE 4: Section D (Analytical Geometry & Euclidean Theorems)
  const page4: SubmissionDocumentPage = {
    pageNumber: 4,
    title: "Section D: Analytical Geometry & Euclidean Circle Proofs",
    sectionCode: "SEC-D",
    marksTotal: 25,
    marksAwarded: 24,
    elements: [
      {
        type: "section_title",
        questionNumber: "SECTION D: COORDINATE CIRCLES & EUCLIDEAN THEOREMS",
        marks: 25
      },
      {
        type: "diagram",
        questionNumber: "Circle Centre & Tangent Perpendicularity",
        diagramType: "analytical_geom",
        explanation: "Radius MP with slope m_radius is perpendicular to tangent line AB: m_radius · m_tangent = -1."
      },
      {
        type: "student_working",
        questionNumber: "4.1",
        questionText: "A circle has equation (x - 3)² + (y + 1)² = 25. Point P(6, 3) lies on the circumference. Determine the equation of the tangent to the circle at point P.   [5 Marks]",
        mathSteps: [
          "Centre of circle M = (3, -1)",
          "Gradient of radius MP = (y_P - y_M) / (x_P - x_M) = (3 - (-1)) / (6 - 3) = 4 / 3",
          "Since tangent is perpendicular to radius at point of contact (tan ⊥ rad):",
          "m_tangent = -1 / (4/3) = -3/4",
          "Equation of tangent through P(6, 3): y - y₁ = m(x - x₁)",
          "y - 3 = -3/4 (x - 6)",
          "y - 3 = -3/4 x + 9/2",
          "y = -3/4 x + 15/2   OR   3x + 4y - 30 = 0"
        ],
        marks: 5,
        awardedMarks: 5,
        isFullyCorrect: true,
        tutorRemark: "✓ Verified with reason: 'radius ⊥ tangent'. Full 5 marks awarded."
      },
      {
        type: "diagram",
        questionNumber: "Euclidean Theorem 2: Angle at Centre = 2 × Angle at Circumference",
        diagramType: "euclidean_circle",
        explanation: "Subtended arc AB creates angle ∠AOB at centre O which is double ∠ACB on the circumference."
      }
    ]
  };

  // PAGE 5: Official Grading Report, Assessment Rubric & Tutor Sign-Off
  const page5: SubmissionDocumentPage = {
    pageNumber: 5,
    title: "Section E: Official Assessment Rubric & Tutor Certification",
    sectionCode: "SEC-E",
    marksTotal: 100,
    marksAwarded: gradeScore || 94,
    elements: [
      {
        type: "section_title",
        questionNumber: "AMARIS MATHEMATICS HUB • OFFICIAL GRADING RUBRIC",
        marks: 100
      },
      {
        type: "marking_rubric_table",
        questionNumber: "Final Evaluation Matrix",
        rubricRows: [
          {
            criterion: "Section A: Algebraic Manipulation & Surds",
            maxMarks: 25,
            awarded: 25,
            feedback: "100% accuracy on roots, factorisation, and restriction verifications."
          },
          {
            criterion: "Section B: Differential Calculus & First Principles",
            maxMarks: 25,
            awarded: 24,
            feedback: "Limit notation preserved throughout. Great stationary point classifications."
          },
          {
            criterion: "Section C: Trigonometry Reduction & Identities",
            maxMarks: 25,
            awarded: 23,
            feedback: "Strong mastery of compound angle expansions and CAST quadrants."
          },
          {
            criterion: "Section D: Analytical Circles & Euclidean Reasons",
            maxMarks: 25,
            awarded: 24,
            feedback: "All geometric statements accompanied by correct CAPS abbreviated reasons."
          }
        ]
      },
      {
        type: "tutor_annotation",
        questionNumber: "Head Instructor Bethuel Moukangwe's Final Sign-Off",
        tutorRemark:
          tutorFeedback ||
          "Outstanding submission! You have demonstrated comprehensive understanding across both Paper 1 (Algebra & Calculus) and Paper 2 (Trigonometry & Geometry). Your step-by-step mathematical reasoning and neat presentation reflect Level 7 Distinction standard. Keep reviewing negative sign distribution during high-speed exam conditions.",
        explanation: `Graded on ${new Date().toLocaleDateString()} • Verified by Amaris Academic Review Board`
      }
    ]
  };

  // Return full 5-page document
  return [page1, page2, page3, page4, page5];
}
