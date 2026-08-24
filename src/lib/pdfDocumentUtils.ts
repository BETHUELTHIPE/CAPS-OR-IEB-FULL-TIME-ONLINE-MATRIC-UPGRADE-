export interface DocumentPage {
  page_number: number;
  title: string;
  elements: Array<{
    type: "text" | "equation" | "tutor_note" | "svg_diagram" | "section_header";
    content?: string;
    equations?: string[];
    diagram_type?: "cast" | "optimization" | "analytical_geom" | "euclidean_circle" | "generic";
  }>;
}

export const getDocumentPages = (itemId: string, itemTitle: string): DocumentPage[] => {
  if (itemId === "res-1") {
    return [
      {
        page_number: 1,
        title: "Section A: Core Formula Definitions",
        elements: [
          { type: "section_header", content: "NATIONAL CURRICULUM STATEMENT (CAPS) - CORE FORMULAE" },
          { type: "text", content: "This certified formula booklet serves as the official reference sheet for all South African Grade 12 National Senior Certificate (NSC) Mathematics candidates taking Paper 1 and Paper 2 exams." },
          { type: "section_header", content: "1. ALGEBRA & SEQUENCES" },
          { type: "equation", equations: ["x = [-b ± √(b² - 4ac)] / 2a", "A = P(1 + i)ⁿ", "A = P(1 - i)ⁿ", "A = P(1 + i·n)"] },
          { type: "tutor_note", content: "TUTOR BETHUEL'S ASSESSMENT TRICK: Quadratic equations in Question 1 are highly predictable. Check the discriminant (b² - 4ac) immediately to verify if roots are real, non-real, equal, or rational." },
          { type: "section_header", content: "2. SERIES SUMMATIONS" },
          { type: "equation", equations: ["T_n = a + (n - 1)d", "S_n = n/2 [2a + (n - 1)d]", "T_n = a · rⁿ⁻¹", "S_n = a(rⁿ - 1)/(r - 1)  (r ≠ 1)", "S_∞ = a / (1 - r)  (-1 < r < 1)"] },
          { type: "tutor_note", content: "STUDY POINTER: S_infinity only exists if -1 < r < 1 (the geometric series converges). If the common ratio is outside this bounds, the infinite sum does not converge!" }
        ]
      },
      {
        page_number: 2,
        title: "Section B: Calculus & Trigonometry",
        elements: [
          { type: "section_header", content: "3. CALCULUS FIRST PRINCIPLES & DERIVATIVES" },
          { type: "equation", equations: ["f'(x) = lim (h -> 0) [f(x + h) - f(x)] / h", "d/dx [xⁿ] = n · xⁿ⁻¹"] },
          { type: "text", content: "Optimization formulas for volume, surface area, and perimeter boundary constraints are derived by setting the first derivative f'(x) equal to zero." },
          { type: "tutor_note", content: "EXAM PENALTY ALERT: In first-principles differentiation, always write the limit operator 'lim (h -> 0)' on every intermediate line until the substitution step, otherwise examiners will penalize you 1 full mark!" },
          { type: "section_header", content: "4. TRIGONOMETRIC COMPOUND & DOUBLE ANGLES" },
          { type: "equation", equations: [
            "sin(A ± B) = sin A cos B ± cos A sin B",
            "cos(A ± B) = cos A cos B ∓ sin A sin B",
            "cos(2A) = cos² A - sin² A = 2cos² A - 1 = 1 - 2sin² A",
            "sin(2A) = 2sin A cos A"
          ] }
        ]
      }
    ];
  } else if (itemId === "res-2") {
    return [
      {
        page_number: 1,
        title: "Trigonometry Reduction & CAST Guide",
        elements: [
          { type: "section_header", content: "THE CAST DIAGRAM & TRIGONOMETRIC QUADRANTS" },
          { type: "text", content: "Understanding quadrants is essential for Grade 11 & 12 CAPS Trigonometry. Use the CAST acronym (All, Sine, Tan, Cos) to quickly establish sign prefixes." },
          { type: "svg_diagram", diagram_type: "cast" },
          { type: "section_header", content: "CO-FUNCTIONS & REDUCTIONS" },
          { type: "text", content: "Angles based on 90° or 270° trigger function switches: sine becomes cosine, and cosine becomes sine. Standard reduction quadrants determine positive or negative multipliers." },
          { type: "equation", equations: [
            "sin(90° - θ) = cos θ",
            "cos(90° - θ) = sin θ",
            "sin(180° - θ) = sin θ   [Quadrant II]",
            "cos(180° + θ) = -cos θ   [Quadrant III]"
          ] },
          { type: "tutor_note", content: "TUTOR REMARK: Always reduce large angles above 360° first by dividing by 360° and working with the remainder. Watch out for negative angles like sin(-x) = -sin(x) versus cos(-x) = cos(x)!" }
        ]
      }
    ];
  } else if (itemId === "res-3") {
    return [
      {
        page_number: 1,
        title: "Differential Calculus Boundary Optimization",
        elements: [
          { type: "section_header", content: "PRACTICAL FENCING OPTIMIZATION EXAMPLE" },
          { type: "text", content: "A farmer wishes to build a rectangular enclosure against a long brick wall, requiring no fencing along the wall. The total available fencing is 24 meters. Determine the dimensions that maximize the area." },
          { type: "svg_diagram", diagram_type: "optimization" },
          { type: "section_header", content: "DERIVATION & STEPS" },
          { type: "equation", equations: [
            "Perimeter: 2x + y = 24  ==>  y = 24 - 2x",
            "Area: A = x · y = x(24 - 2x) = 24x - 2x²",
            "Derivative: A'(x) = 24 - 4x",
            "Maximum: Set A'(x) = 0  ==> 24 - 4x = 0  ==> x = 6",
            "Dimensions: Width = 6m, Length = 12m  ==> Max Area = 72m²"
          ] },
          { type: "tutor_note", content: "VISUAL MODELING: Move the slider above to see how changing the fencing width (x) shrinks or expands the total simulated area. The optimal point is precisely where the rate-of-change curve slope hits zero!" }
        ]
      }
    ];
  } else if (itemId === "res-8") {
    return [
      {
        page_number: 1,
        title: "Coordinate Proofs & Tangent Lines",
        elements: [
          { type: "section_header", content: "ANALYTICAL GEOMETRY COMPREHENSIVE GUIDE" },
          { type: "text", content: "Grade 11 and 12 coordinate geometry tests focus heavily on perpendicular lines, circles, and angles of inclination. Practice calculating distances and slopes." },
          { type: "svg_diagram", diagram_type: "analytical_geom" },
          { type: "section_header", content: "IMPORTANT RATIOS" },
          { type: "equation", equations: [
            "Distance: d = √[(x₂ - x₁)² + (y₂ - y₁)²]",
            "Midpoint: M([x₁ + x₂]/2, [y₁ + y₂]/2)",
            "Gradient: m = (y₂ - y₁) / (x₂ - x₁) = tan θ",
            "Perpendicular Lines: m₁ · m₂ = -1"
          ] },
          { type: "tutor_note", content: "TUTOR TRICK: When proving that a line is a tangent to a circle, show that the radius from the circle center to the point of contact is perpendicular to the line (i.e. slopes multiply to -1)." }
        ]
      }
    ];
  } else if (itemId === "res-10") {
    return [
      {
        page_number: 1,
        title: "Circle Theorems: Arc & Center",
        elements: [
          { type: "section_header", content: "EUCLIDEAN PROOF: ANGLE AT THE CENTER" },
          { type: "text", content: "Theorem: The angle subtended by an arc at the center of a circle is double the angle subtended by the same arc at any point on the circumference." },
          { type: "svg_diagram", diagram_type: "euclidean_circle" },
          { type: "section_header", content: "THEORETICAL THEOREMS RECAP" },
          { type: "text", content: "Ensure you know all 9 theorems. For writing your proofs, always include the official abbreviated reasons (e.g., 'angle at centre = 2x angle at circumf')." },
          { type: "equation", equations: [
            "Angle at Center = 2 × Angle at Circumference",
            "Opposite angles of cyclic quad are supplementary (A + C = 180°)"
          ] },
          { type: "tutor_note", content: "GEOMETRY NOTE: Use the interactive circular model above. No matter where you place the boundary point along the major arc, the center angle remains exactly twice the angle at the circumference!" }
        ]
      }
    ];
  } else if (itemId === "res-4" || itemId === "res-6") {
    return [
      {
        page_number: 1,
        title: "Instructions & Coversheet",
        elements: [
          { type: "section_header", content: "NATIONAL SENIOR CERTIFICATE / GRADE 12 FINAL EXAM" },
          { type: "text", content: "MATHEMATICS P1 - EXAM REVISION PAPER\nMARKS: 150\nTIME: 3 HOURS\n\nINSTRUCTIONS AND INFORMATION:\n1. This question paper consists of 11 questions.\n2. Answer ALL the questions.\n3. Clearly show ALL calculations, diagrams, graphs, etc. which you have used in determining your answers.\n4. Answers only will NOT necessarily be awarded full marks.\n5. You may use an approved scientific calculator (non-programmable and non-graphical), unless stated otherwise." }
        ]
      },
      {
        page_number: 2,
        title: "Question 1: Quadratic Algebra",
        elements: [
          { type: "section_header", content: "QUESTION 1 (25 MARKS)" },
          { type: "text", content: "1.1 Solve for x:\n1.1.1  x² - 5x + 6 = 0   (3 marks)\n1.1.2  3x² - 2x = 7 (correct to two decimal places)   (4 marks)\n1.1.3  (x - 3)(x + 1) < 0   (3 marks)" },
          { type: "text", content: "1.2 Solve simultaneously for x and y:\n   x + y = 3   and   2x² + xy - y² = 0   (6 marks)" },
          { type: "tutor_note", content: "BETHUEL'S STUDY ADVICE: Question 1.1.2 explicitly specifies 'correct to two decimal places'. This is a direct keyword that means factorization is impossible and you MUST use the quadratic formula!" }
        ]
      }
    ];
  } else if (itemId === "res-5" || itemId === "res-7") {
    return [
      {
        page_number: 1,
        title: "Marking Guidelines Coversheet",
        elements: [
          { type: "section_header", content: "SENIOR CERTIFICATE EXAMINATIONS - OFFICIAL MEMORANDUM" },
          { type: "text", content: "MATHEMATICS P1 / SUGGESTED SOLUTIONS & MARKING RUBRICS\n\nThese guidelines consist of official suggested solutions, mark allocation steps, and alternative calculation strategies for checking candidate scripts." }
        ]
      },
      {
        page_number: 2,
        title: "Question 1 marking breakdown",
        elements: [
          { type: "section_header", content: "QUESTION 1 SOLUTIONS" },
          { type: "text", content: "1.1.1  x² - 5x + 6 = 0  =>  (x - 2)(x - 3) = 0  =>  x = 2  or  x = 3\n  [✓] factorisation  [✓] x = 2  [✓] x = 3   (3 marks)" },
          { type: "text", content: "1.1.2  3x² - 2x - 7 = 0  =>  x = [-b ± √(b² - 4ac)] / 2a\n  x = [2 ± √(4 - 4(3)(-7))] / 6  =>  x = [2 ± √88] / 6\n  x ≈ 1.90  or  x ≈ -1.23\n  [✓] standard form  [✓] substitution  [✓] answer 1.90  [✓] answer -1.23   (4 marks)" },
          { type: "tutor_note", content: "MEMO GRADING NOTE: Accept any mathematically sound alternative methods, such as completing the square. Ensure rounding off to 2 decimals is strictly followed." }
        ]
      }
    ];
  } else {
    return [
      {
        page_number: 1,
        title: "Study Guide Chapter Overview",
        elements: [
          { type: "section_header", content: itemTitle.toUpperCase() },
          { type: "text", content: `Welcome to the official, certified textbook and study resource booklet. This content has been verified by the Amaris Mathematics Hub panel to align with NSC CAPS and IEB matric specifications.` },
          { type: "svg_diagram", diagram_type: "generic" },
          { type: "section_header", content: "CORE LEARNING OUTCOMES" },
          { type: "text", content: "1. Master standard formulas and proof structures.\n2. Dedicate at least 45 minutes daily to physical sketch-pad exercise solving.\n3. Verify critical solutions using our online Calculator Sandbox." },
          { type: "tutor_note", content: "AMARIS ADVICE: Always begin with the foundational theory first before attempting past paper exam questions. Keep a separate formula ledger to review formulas the night before high-stakes trials!" }
        ]
      }
    ];
  }
};

export const getDocumentOutline = (itemId: string) => {
  if (itemId === "res-1") {
    return [
      { id: "sec1", title: "Algebra Formulae", page: 1 },
      { id: "sec2", title: "Series & Sequences", page: 1 },
      { id: "sec3", title: "Calculus Limits", page: 2 },
      { id: "sec4", title: "Trigonometry Angles", page: 2 }
    ];
  } else if (itemId === "res-2") {
    return [
      { id: "sec1", title: "CAST Quadrants Diagram", page: 1 },
      { id: "sec2", title: "Co-Functions Definitions", page: 1 }
    ];
  } else if (itemId === "res-3") {
    return [
      { id: "sec1", title: "Fence Area Optimization", page: 1 },
      { id: "sec2", title: "Cubic Optimization Curves", page: 1 }
    ];
  } else if (itemId === "res-8") {
    return [
      { id: "sec1", title: "Analytical Coordinates", page: 1 },
      { id: "sec2", title: "Tangent Slopes", page: 1 }
    ];
  } else if (itemId === "res-10") {
    return [
      { id: "sec1", title: "Angle at Centre Theorem", page: 1 },
      { id: "sec2", title: "Cyclic Quad Proofs", page: 1 }
    ];
  } else if (itemId === "res-4" || itemId === "res-6") {
    return [
      { id: "sec1", title: "Instructions and Coversheet", page: 1 },
      { id: "sec2", title: "Question 1: Quadratic Algebra", page: 2 }
    ];
  } else if (itemId === "res-5" || itemId === "res-7") {
    return [
      { id: "sec1", title: "Marking Memo Introduction", page: 1 },
      { id: "sec2", title: "Question 1 Solutions", page: 2 }
    ];
  } else {
    return [
      { id: "sec1", title: "Study Guide Cover", page: 1 },
      { id: "sec2", title: "Concept Mastery Checklist", page: 1 }
    ];
  }
};
