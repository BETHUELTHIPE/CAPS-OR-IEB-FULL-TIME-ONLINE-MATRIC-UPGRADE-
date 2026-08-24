export interface SyllabusCard {
  id: string;
  title: string;
  strand: 
    | "Algebra & Exponents"
    | "Sequences & Series"
    | "Functions & Inverses"
    | "Financial Mathematics"
    | "Differential Calculus"
    | "Analytical Geometry"
    | "Trigonometry"
    | "Euclidean Geometry"
    | "Statistics"
    | "Probability"
    | "AP & Advanced Maths";
  paper: "Paper 1" | "Paper 2" | "Both";
  grade: "Grade 10" | "Grade 11" | "Grade 12" | "Matric Upgrade" | "All Grades";
  syllabus: "CAPS" | "IEB" | "Both";
  examWeightage: string; // e.g. "25 Marks (~17% of Paper 1)"
  subtopics: string[];
  keyFormulae: string[];
  examTip: string;
  commonMistakes: string;
  sampleQuestion: string;
  sampleSolution: string;
  difficulty: "Core" | "Intermediate" | "Advanced" | "High Yield";
  estimatedStudyTime: string; // e.g. "3-4 Hours"
}

export const ALL_SYLLABUS_CARDS: SyllabusCard[] = [
  // ----------------------------------------------------
  // PAPER 1: ALGEBRA, EXPONENTS & SURDS
  // ----------------------------------------------------
  {
    id: "syl-exp-surds",
    title: "Exponents, Surds & Algebraic Expressions",
    strand: "Algebra & Exponents",
    paper: "Paper 1",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "10-15 Marks in Paper 1",
    difficulty: "Core",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Exponential laws & fractional exponents $a^{m/n} = \\sqrt[n]{a^m}$",
      "Simplifying exponential expressions without a calculator",
      "Surd form equations & rationalizing denominators",
      "Solving exponential equations using $k$-substitution",
      "Algebraic fractions & factorization techniques"
    ],
    keyFormulae: [
      "a^{\\frac{m}{n}} = \\sqrt[n]{a^m}",
      "a^{-n} = \\frac{1}{a^n}",
      "\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}",
      "(a - b)(a + b) = a^2 - b^2"
    ],
    examTip: "When solving surd equations like $\\sqrt{x+3} = x - 1$, ALWAYS check your solutions in the original equation to eliminate non-real or extraneous roots!",
    commonMistakes: "Incorrectly distributing square roots over sums: $\\sqrt{a^2 + b^2} \\neq a + b$.",
    sampleQuestion: "Solve for $x$ without using a calculator: $2^{x+2} + 2^x = 40$.",
    sampleSolution: "Factor out $2^x$: $2^x(2^2 + 1) = 40 \\implies 2^x(5) = 40 \\implies 2^x = 8 \\implies 2^x = 2^3 \\implies x = 3$."
  },
  {
    id: "syl-quad-equations",
    title: "Quadratic Equations, Inequalities & K-Substitution",
    strand: "Algebra & Exponents",
    paper: "Paper 1",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "15-20 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "3-4 Hours",
    subtopics: [
      "Standard quadratic form $ax^2 + bx + c = 0$",
      "Quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ & completing the square",
      "Quadratic inequalities (parabola method & critical values)",
      "$k$-substitution method for complex exponents & repeated terms",
      "Simultaneous linear & quadratic equations"
    ],
    keyFormulae: [
      "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      "x = -\\frac{b}{2a} \\quad \\text{(Axis of Symmetry)}",
      "x^2 - (x_1 + x_2)x + (x_1 x_2) = 0"
    ],
    examTip: "For quadratic inequalities like $(x-2)(x+5) < 0$, sketch a quick parabola or number line with critical values $x = 2$ and $x = -5$. Between roots is negative!",
    commonMistakes: "Forgetting to flip the inequality sign when multiplying or dividing by a negative number.",
    sampleQuestion: "Solve for $x$: $(2x - 1)(x + 3) \\ge 0$.",
    sampleSolution: "Critical values: $x = \\frac{1}{2}$ and $x = -3$. Since it is $\\ge 0$ (above the horizontal axis): $x \\le -3$ or $x \\ge \\frac{1}{2}$."
  },
  {
    id: "syl-discriminant-roots",
    title: "The Discriminant & Nature of Roots",
    strand: "Algebra & Exponents",
    paper: "Paper 1",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "8-12 Marks in Paper 1",
    difficulty: "Intermediate",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Calculating the discriminant $\\Delta = b^2 - 4ac$",
      "Real vs Non-Real roots ($\\Delta \\ge 0$ vs $\\Delta < 0$)",
      "Equal vs Unequal roots ($\\Delta = 0$ vs $\\Delta > 0$)",
      "Rational vs Irrational roots (perfect square condition)",
      "Proving roots are real for all values of $k$"
    ],
    keyFormulae: [
      "\\Delta = b^2 - 4ac",
      "\\Delta > 0 \\land \\text{perfect square} \\implies \\text{Real, Rational, Unequal}",
      "\\Delta < 0 \\implies \\text{Non-Real (Complex)}",
      "\\Delta = 0 \\implies \\text{Real, Rational, Equal}"
    ],
    examTip: "To show roots are real for ALL values of $k$, prove that $\\Delta$ can be written as a perfect square plus a non-negative constant: $\\Delta = (k-p)^2 + q \\ge 0$.",
    commonMistakes: "Confusing $\\Delta = 0$ (equal roots) with $\\Delta \\ge 0$ (real roots). Always read the question wording carefully!",
    sampleQuestion: "Determine the nature of the roots of $3x^2 - 5x + 4 = 0$.",
    sampleSolution: "\\Delta = (-5)^2 - 4(3)(4) = 25 - 48 = -23. Since $\\Delta < 0$, the roots are non-real (complex)."
  },
  {
    id: "syl-simultaneous-eq",
    title: "Simultaneous Equations & Graphical Intersections",
    strand: "Algebra & Exponents",
    paper: "Paper 1",
    grade: "Grade 10",
    syllabus: "Both",
    examWeightage: "6-10 Marks in Paper 1",
    difficulty: "Core",
    estimatedStudyTime: "2 Hours",
    subtopics: [
      "Linear & quadratic simultaneous substitution",
      "Expressing one variable in terms of the other",
      "Intersections of straight lines, parabolas & hyperbolas",
      "Real-world word problem setups"
    ],
    keyFormulae: [
      "y = mx + c \\quad \\& \\quad y = ax^2 + bx + c",
      "y_1 = y_2 \\implies \\text{Solve for } x \\text{ intersection}"
    ],
    examTip: "Always make the linear variable with a coefficient of $1$ (or $-1$) the subject of the formula first to avoid messy fraction algebra!",
    commonMistakes: "Solving for $x$ and forgetting to substitute back into the linear equation to find the corresponding $y$ values.",
    sampleQuestion: "Solve simultaneously for $x$ and $y$: $y - 2x = 1$ and $x^2 + y^2 = 13$.",
    sampleSolution: "From linear: $y = 2x + 1$. Substitute into quadratic: $x^2 + (2x+1)^2 = 13 \\implies 5x^2 + 4x - 12 = 0 \\implies (5x-6)(x+2) = 0$. So $x = \\frac{6}{5}$ or $x = -2$. Substituting back: $y = \\frac{17}{5}$ or $y = -3$."
  },

  // ----------------------------------------------------
  // SEQUENCES & SERIES
  // ----------------------------------------------------
  {
    id: "syl-linear-quadratic-seq",
    title: "Linear & Quadratic Sequences (Second Differences)",
    strand: "Sequences & Series",
    paper: "Paper 1",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "10-12 Marks in Paper 1",
    difficulty: "Core",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Linear general term $T_n = dn + c$",
      "Constant second difference ($2a = d_2$)",
      "Finding $a, b, c$ for quadratic $T_n = an^2 + bn + c$",
      "Finding maximum or minimum term values of a sequence",
      "Determining if a given number is a term in a sequence"
    ],
    keyFormulae: [
      "2a = \\text{Constant 2nd Difference}",
      "3a + b = T_2 - T_1 \\quad \\text{(First 1st Difference)}",
      "a + b + c = T_1 \\quad \\text{(First Term)}",
      "T_n = an^2 + bn + c"
    ],
    examTip: "To find which term has the maximum value in a quadratic sequence where $a < 0$, set $n = -\\frac{b}{2a}$ or find the turning point of $T_n$!",
    commonMistakes: "Setting $n$ equal to the value instead of setting $T_n$ equal to the value when checking if a number belongs to the sequence.",
    sampleQuestion: "Given the quadratic sequence $4; 11; 22; 37...$, find $T_n$.",
    sampleSolution: "1st differences: $7, 11, 15$. 2nd difference: $4$.\n$2a = 4 \\implies a = 2$.\n$3(2) + b = 7 \\implies b = 1$.\n$2 + 1 + c = 4 \\implies c = 1$.\nThus $T_n = 2n^2 + n + 1$."
  },
  {
    id: "syl-arithmetic-series",
    title: "Arithmetic Sequences & Series",
    strand: "Sequences & Series",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "12-15 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "3 Hours",
    subtopics: [
      "Constant difference $d = T_2 - T_1 = T_3 - T_2$",
      "General term formula $T_n = a + (n-1)d$",
      "Sum of arithmetic series $S_n = \\frac{n}{2}[2a + (n-1)d]$",
      "Alternative sum formula $S_n = \\frac{n}{2}[a + L]$",
      "Formal proof of sum formula for NSC Paper 1 exam"
    ],
    keyFormulae: [
      "T_n = a + (n-1)d",
      "S_n = \\frac{n}{2}[2a + (n-1)d]",
      "S_n = \\frac{n}{2}[a + L]",
      "T_n = S_n - S_{n-1}"
    ],
    examTip: "Learn the formal algebraic proof of $S_n = \\frac{n}{2}[2a + (n-1)d]$ off by heart! It is examined almost every year in Paper 1 for 4-5 free marks.",
    commonMistakes: "Confusing $T_n$ (the value of term $n$) with $S_n$ (the sum of the first $n$ terms).",
    sampleQuestion: "In an arithmetic sequence, $T_3 = 11$ and $T_8 = 31$. Find $a$ and $d$.",
    sampleSolution: "$a + 2d = 11$ and $a + 7d = 31$. Subtract equations: $5d = 20 \\implies d = 4$. Substitute back: $a + 8 = 11 \\implies a = 3$."
  },
  {
    id: "syl-geometric-series",
    title: "Geometric Sequences & Series",
    strand: "Sequences & Series",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "12-15 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "3 Hours",
    subtopics: [
      "Constant ratio $r = \\frac{T_2}{T_1} = \\frac{T_3}{T_2}$",
      "General term formula $T_n = a \\cdot r^{n-1}$",
      "Sum of geometric series $S_n = \\frac{a(r^n - 1)}{r - 1}$",
      "Formal proof of geometric sum formula",
      "Solving exponential term numbers using logarithms"
    ],
    keyFormulae: [
      "T_n = a \\cdot r^{n-1}",
      "S_n = \\frac{a(r^n - 1)}{r - 1} \\quad (r \\neq 1)",
      "r = \\frac{T_2}{T_1} = \\frac{T_3}{T_2}"
    ],
    examTip: "When asked for the smallest value of $n$ such that $S_n > 10000$, set up the inequality, apply logarithms, and remember to flip the sign if dividing by $\\log r$ when $r < 1$!",
    commonMistakes: "Calculating common ratio as subtraction instead of division: $r = \\frac{T_2}{T_1}$.",
    sampleQuestion: "For the geometric sequence $3, 6, 12, 24...$, find $T_{10}$ and $S_{10}$.",
    sampleSolution: "$a = 3$, $r = 2$.\n$T_{10} = 3(2)^9 = 3(512) = 1536$.\n$S_{10} = \\frac{3(2^{10} - 1)}{2 - 1} = 3(1023) = 3069$."
  },
  {
    id: "syl-infinite-geometric-sigma",
    title: "Infinite Geometric Series & Sigma Notation (\\sum)",
    strand: "Sequences & Series",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "10-12 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Convergence condition $-1 < r < 1$",
      "Sum to infinity formula $S_\\infty = \\frac{a}{1 - r}$",
      "Sigma notation expansion $\\sum_{k=m}^{n} T_k$",
      "Calculating number of terms in sigma: $n - m + 1$",
      "Applications in recurring decimals & physical bouncing ball problems"
    ],
    keyFormulae: [
      "S_\\infty = \\frac{a}{1 - r} \\quad (-1 < r < 1)",
      "\\text{Number of terms} = \\text{Top} - \\text{Bottom} + 1",
      "r = \\frac{T_2}{T_1}"
    ],
    examTip: "A series CONVERGES if and only if $-1 < r < 1$ (or $|r| < 1$). If $r \\ge 1$ or $r \\le -1$, the series diverges and $S_\\infty$ does NOT exist!",
    commonMistakes: "Calculating the number of terms in $\\sum_{k=3}^{12} T_k$ as $12 - 3 = 9$ instead of $12 - 3 + 1 = 10$ terms.",
    sampleQuestion: "Evaluate $\\sum_{k=1}^{\\infty} 12(0.5)^{k-1}$.",
    sampleSolution: "First term $a = 12(0.5)^0 = 12$, common ratio $r = 0.5$. Since $|0.5| < 1$, $S_\\infty = \\frac{12}{1 - 0.5} = \\frac{12}{0.5} = 24$."
  },

  // ----------------------------------------------------
  // FUNCTIONS, INVERSES & GRAPHS
  // ----------------------------------------------------
  {
    id: "syl-parabola-functions",
    title: "Parabolic Quadratic Functions & Transformations",
    strand: "Functions & Inverses",
    paper: "Paper 1",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "15-20 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "3-4 Hours",
    subtopics: [
      "Standard form $y = ax^2 + bx + c$ & Turning point form $y = a(x-p)^2 + q$",
      "Turning point axis of symmetry $x = -\\frac{b}{2a}$",
      "Domain ($x \\in \\mathbb{R}$) & Range ($y \\ge q$ or $y \\le q$)",
      "Vertical & horizontal translations ($p$ and $q$)",
      "Finding function equations from roots and axis intercepts"
    ],
    keyFormulae: [
      "y = a(x - p)^2 + q \\quad \\text{(Turning Point Form)}",
      "x = -\\frac{b}{2a} \\quad \\text{(Axis of Symmetry)}",
      "y = a(x - x_1)(x - x_2) \\quad \\text{(Root Form)}"
    ],
    examTip: "To find the axis of symmetry quickly, use $x = \\frac{x_1 + x_2}{2}$ where $x_1$ and $x_2$ are the two $x$-intercepts!",
    commonMistakes: "Getting signs backwards in turning point form $y = a(x - p)^2 + q$: if turning point is $(3, -4)$, equation is $y = a(x - 3)^2 - 4$.",
    sampleQuestion: "Find the turning point of $f(x) = 2x^2 - 8x + 3$.",
    sampleSolution: "$x = -\\frac{-8}{2(2)} = 2$. $f(2) = 2(2)^2 - 8(2) + 3 = 8 - 16 + 3 = -5$. Turning point is $(2, -5)$."
  },
  {
    id: "syl-hyperbola-functions",
    title: "Hyperbolic Functions & Asymptotes",
    strand: "Functions & Inverses",
    paper: "Paper 1",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "10-14 Marks in Paper 1",
    difficulty: "Intermediate",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Standard hyperbola $y = \\frac{a}{x - p} + q$",
      "Vertical asymptote $x = p$ & Horizontal asymptote $y = q$",
      "Axes of symmetry $y = (x - p) + q$ and $y = -(x - p) + q$",
      "Domain $x \\in \\mathbb{R}, x \\neq p$ & Range $y \\in \\mathbb{R}, y \\neq q$",
      "Sketching hyperbolas in quadrants 1/3 ($a > 0$) vs 2/4 ($a < 0$)"
    ],
    keyFormulae: [
      "y = \\frac{a}{x - p} + q",
      "x = p \\quad \\text{(Vertical Asymptote)}",
      "y = q \\quad \\text{(Horizontal Asymptote)}",
      "y = \\pm(x - p) + q \\quad \\text{(Axes of Symmetry)}"
    ],
    examTip: "The axes of symmetry ALWAYS intersect at the intersection of the two asymptotes $(p, q)$ with gradients $m = 1$ and $m = -1$!",
    commonMistakes: "Forgetting to label asymptotes as dashed lines with their full equations ($x = p$ and $y = q$) on exam graphs.",
    sampleQuestion: "Find asymptotes and axes of symmetry for $y = \\frac{6}{x + 2} - 1$.",
    sampleSolution: "Asymptotes: $x = -2$ and $y = -1$.\nAxes of symmetry: $y = (x + 2) - 1 = x + 1$ and $y = -(x + 2) - 1 = -x - 3$."
  },
  {
    id: "syl-exponential-log-inverses",
    title: "Exponential, Logarithmic Functions & Inverses",
    strand: "Functions & Inverses",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "15-20 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "3-4 Hours",
    subtopics: [
      "Exponential form $y = a \\cdot b^{x-p} + q$",
      "Logarithmic definition $y = \\log_b x$ as inverse of $y = b^x$",
      "Reflection across line $y = x$",
      "Logarithmic laws & change of base formula",
      "Restricting domains to make quadratic functions one-to-one"
    ],
    keyFormulae: [
      "y = b^x \\iff x = \\log_b y",
      "f^{-1}(x): \\text{Swap } x \\text{ and } y",
      "\\log(AB) = \\log A + \\log B",
      "\\log\\left(\\frac{A}{B}\\right) = \\log A - \\log B"
    ],
    examTip: "The inverse of an exponential function $y = b^x$ is ALWAYS the logarithmic function $y = \\log_b x$. Intercepts swap: $(0, 1)$ becomes $(1, 0)$!",
    commonMistakes: "Attempting to take the logarithm of a negative number or zero.",
    sampleQuestion: "Given $f(x) = 3^x$, find $f^{-1}(x)$ and state its domain.",
    sampleSolution: "Swap $x$ and $y$: $x = 3^y \\implies y = \\log_3 x$. Thus $f^{-1}(x) = \\log_3 x$. Domain: $x > 0$."
  },

  // ----------------------------------------------------
  // FINANCIAL MATHEMATICS
  // ----------------------------------------------------
  {
    id: "syl-interest-depreciation",
    title: "Simple & Compound Interest, Inflation & Depreciation",
    strand: "Financial Mathematics",
    paper: "Paper 1",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "6-10 Marks in Paper 1",
    difficulty: "Core",
    estimatedStudyTime: "2 Hours",
    subtopics: [
      "Simple interest $A = P(1 + in)$ & Compound interest $A = P(1 + i)^n$",
      "Straight-line decay $A = P(1 - in)$ & Reducing-balance decay $A = P(1 - i)^n$",
      "Nominal vs Effective interest rates $1 + i_{eff} = \\left(1 + \\frac{i^{(m)}}{m}\\right)^m$",
      "Compounding frequencies (monthly, quarterly, semi-annually)",
      "Inflation & purchasing power calculations"
    ],
    keyFormulae: [
      "A = P(1 + i)^n \\quad \\text{(Compound Interest)}",
      "A = P(1 - i)^n \\quad \\text{(Reducing Balance Decay)}",
      "1 + i_{eff} = \\left(1 + \\frac{i^{(m)}}{m}\\right)^m"
    ],
    examTip: "Always convert annual nominal rate $i$ to period interest rate (e.g. $12\\%$ p.a. monthly $= \\frac{0.12}{12} = 0.01$) and $n$ to total compounding periods (e.g. $5$ years $= 60$ months)!",
    commonMistakes: "Using percentages as whole numbers (e.g. $8$) instead of decimals ($0.08$) in financial formulas.",
    sampleQuestion: "Calculate the effective annual interest rate for $14\\%$ per annum compounded monthly.",
    sampleSolution: "$1 + i_{eff} = \\left(1 + \\frac{0.14}{12}\\right)^{12} = (1.011667)^{12} = 1.14934 \\implies i_{eff} = 14.93\\%$ p.a."
  },
  {
    id: "syl-annuities-loans-sinking",
    title: "Present & Future Value Annuities, Loans & Sinking Funds",
    strand: "Financial Mathematics",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "12-15 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "3-4 Hours",
    subtopics: [
      "Present Value Annuities $P_v$ (Loans, Mortgages, Car Finance)",
      "Future Value Annuities $F_v$ (Savings, Investments, Retirement)",
      "Deferred payment loans (interest accrues before repayments start)",
      "Sinking funds for future equipment replacement",
      "Outstanding loan balance calculations"
    ],
    keyFormulae: [
      "P_v = \\frac{x[1 - (1+i)^{-n}]}{i} \\quad \\text{(Present Value / Loan)}",
      "F_v = \\frac{x[(1+i)^n - 1]}{i} \\quad \\text{(Future Value / Savings)}",
      "\\text{Outstanding Balance} = P_v \\text{ for remaining } (n-k) \\text{ payments}"
    ],
    examTip: "Use Present Value $P_v$ when money is granted TODAY and paid back over time. Use Future Value $F_v$ when small regular payments accumulate to a lump sum in the FUTURE!",
    commonMistakes: "Forgetting to add compound interest accrued during a deferred period before applying the $P_v$ formula.",
    sampleQuestion: "Calculate the monthly repayment on a $\\text{R}500,000$ home loan over $20$ years at $9\\%$ p.a. compounded monthly.",
    sampleSolution: "$P_v = 500000$, $i = \\frac{0.09}{12} = 0.0075$, $n = 240$.\n$500000 = \\frac{x[1 - (1.0075)^{-240}]}{0.0075} \\implies x = \\text{R}4,498.63$ per month."
  },

  // ----------------------------------------------------
  // DIFFERENTIAL CALCULUS
  // ----------------------------------------------------
  {
    id: "syl-calculus-limits-first-principles",
    title: "Average Rates of Change, Limits & First Principles",
    strand: "Differential Calculus",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "10-14 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "3 Hours",
    subtopics: [
      "Average rate of change $= \\frac{f(b) - f(a)}{b - a}$",
      "Concept of instantaneous rate of change as secant approaches tangent",
      "Evaluating algebraic limits $\\lim_{x \\to a} f(x)$",
      "Derivative from first principles $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$",
      "Proof of derivative for linear, quadratic, and simple cubic functions"
    ],
    keyFormulae: [
      "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
      "\\text{Average Rate} = \\frac{f(b) - f(a)}{b - a}"
    ],
    examTip: "In first principles proof, keep writing '\\lim_{h\\to 0}' on EVERY step until you actually substitute $h = 0$ in the final line!",
    commonMistakes: "Dropping the $\\lim_{h\\to 0}$ operator too early or making expansion errors with $(x+h)^2$ or $(x+h)^3$.",
    sampleQuestion: "Differentiate $f(x) = 3x^2$ from first principles.",
    sampleSolution: "$f'(x) = \\lim_{h\\to 0} \\frac{3(x+h)^2 - 3x^2}{h} = \\lim_{h\\to 0} \\frac{3(x^2 + 2xh + h^2) - 3x^2}{h} = \\lim_{h\\to 0} \\frac{6xh + 3h^2}{h} = \\lim_{h\\to 0} (6x + 3h) = 6x$."
  },
  {
    id: "syl-calculus-rules-tangents",
    title: "Rules of Differentiation & Equations of Tangents",
    strand: "Differential Calculus",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "12-16 Marks in Paper 1",
    difficulty: "Core",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Power rule $\\frac{d}{dx}[x^n] = n x^{n-1}$",
      "Preparing expressions: fractional exponents & negative powers",
      "Finding derivative gradient $m = f'(x_1)$ at a given $x$",
      "Equation of tangent line $y - y_1 = m(x - x_1)$",
      "Perpendicular normal lines ($m_1 \\cdot m_2 = -1$)"
    ],
    keyFormulae: [
      "\\frac{d}{dx}[x^n] = n x^{n-1}",
      "\\frac{d}{dx}[k] = 0",
      "y - y_1 = f'(x_1)(x - x_1)"
    ],
    examTip: "Before applying power rule, expand all brackets, split fractions over single denominators, and convert surds to fractional exponents!",
    commonMistakes: "Differentiating numerators and denominators separately in fractions like $\\frac{x^2+1}{x}$ instead of splitting into $x + x^{-1}$.",
    sampleQuestion: "Find the equation of the tangent to $y = x^3 - 4x + 2$ at $x = 2$.",
    sampleSolution: "At $x = 2$: $y = (2)^3 - 4(2) + 2 = 2$.\nDerivative $\\frac{dy}{dx} = 3x^2 - 4$.\nGradient $m = 3(2)^2 - 4 = 8$.\nTangent equation: $y - 2 = 8(x - 2) \\implies y = 8x - 14$."
  },
  {
    id: "syl-calculus-cubic-sketching",
    title: "Cubic Polynomials, Curve Sketching & Inflexion",
    strand: "Differential Calculus",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "18-22 Marks in Paper 1",
    difficulty: "High Yield",
    estimatedStudyTime: "4 Hours",
    subtopics: [
      "Factor theorem & synthetic division for cubic $f(x) = ax^3 + bx^2 + cx + d$",
      "Finding $x$-intercepts ($f(x) = 0$) & $y$-intercept $(0, d)$",
      "Stationary turning points where $f'(x) = 0$ (local max/min)",
      "Point of inflection where $f''(x) = 0$ or $x = -\\frac{b}{3a}$",
      "Concavity: concave up ($f'' > 0$) vs concave down ($f'' < 0$)"
    ],
    keyFormulae: [
      "f'(x) = 0 \\implies \\text{Stationary Turning Points}",
      "f''(x) = 0 \\implies \\text{Point of Inflection}",
      "x = -\\frac{b}{3a} \\quad \\text{(Point of Inflection x-coord)}"
    ],
    examTip: "Stationary points occur where gradient is $0$ ($f'(x) = 0$). Point of inflection occurs where concavity changes ($f''(x) = 0$). Don't confuse 1st and 2nd derivatives!",
    commonMistakes: "Forgetting to calculate $y$-coordinates for turning points and inflection points before plotting.",
    sampleQuestion: "Find the turning points of $f(x) = x^3 - 3x^2 - 9x + 5$.",
    sampleSolution: "$f'(x) = 3x^2 - 6x - 9 = 0 \\implies x^2 - 2x - 3 = 0 \\implies (x-3)(x+1) = 0$.\nSo $x = 3$ or $x = -1$.\n$f(3) = -22 \\implies \\text{local min } (3, -22)$.\n$f(-1) = 10 \\implies \\text{local max } (-1, 10)$."
  },
  {
    id: "syl-calculus-optimization",
    title: "Calculus Optimization & Practical Applications",
    strand: "Differential Calculus",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "10-15 Marks in Paper 1",
    difficulty: "Advanced",
    estimatedStudyTime: "3-4 Hours",
    subtopics: [
      "Setting up single variable functions for Volume, Surface Area, Distance, or Profit",
      "Using constraints to eliminate secondary variables",
      "Setting derivative to zero $A'(x) = 0$ or $V'(r) = 0$ to maximize/minimize",
      "Proving maximum or minimum using second derivative test",
      "Geometric applications (cylinders, cones, boxes, fencing)"
    ],
    keyFormulae: [
      "\\frac{dV}{dx} = 0 \\implies \\text{Maximum / Minimum Volume}",
      "V_{\\text{cylinder}} = \\pi r^2 h",
      "A_{\\text{total}} = 2\\pi r^2 + 2\\pi r h"
    ],
    examTip: "Always re-read the question to ensure you answer what was asked: do they want the value of $x$ that maximizes volume, OR the actual maximum volume itself?",
    commonMistakes: "Errors in secondary variable substitution before taking the derivative.",
    sampleQuestion: "An open box with square base $x$ and height $h$ has volume $108\\text{ cm}^3$. Show surface area $A = x^2 + \\frac{432}{x}$, then find $x$ for minimum area.",
    sampleSolution: "Volume $x^2 h = 108 \\implies h = \\frac{108}{x^2}$.\nArea $A = x^2 + 4xh = x^2 + 4x\\left(\\frac{108}{x^2}\\right) = x^2 + \\frac{432}{x}$.\nTake derivative: $A'(x) = 2x - \\frac{432}{x^2} = 0 \\implies 2x^3 = 432 \\implies x^3 = 216 \\implies x = 6\\text{ cm}$."
  },

  // ----------------------------------------------------
  // PROBABILITY
  // ----------------------------------------------------
  {
    id: "syl-probability-rules-venn",
    title: "Probability Rules, Venn Diagrams & Contingency Tables",
    strand: "Probability",
    paper: "Paper 1",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "10-12 Marks in Paper 1",
    difficulty: "Core",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Sample space & relative frequency $P(A) = \\frac{n(A)}{n(S)}$",
      "Addition rule $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$",
      "Mutually exclusive events ($P(A \\cap B) = 0$)",
      "Independent events test ($P(A \\cap B) = P(A) \\cdot P(B)$)",
      "Venn diagrams with 2 and 3 sets & 2-way contingency tables"
    ],
    keyFormulae: [
      "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)",
      "P(A \\cap B) = P(A) \\cdot P(B) \\iff \\text{Independent}",
      "P(A') = 1 - P(A) \\quad \\text{(Complement)}"
    ],
    examTip: "To prove two events $A$ and $B$ are independent in Paper 1: Calculate $P(A) \\times P(B)$ separately, then check if it equals $P(A \\cap B)$ given in the question!",
    commonMistakes: "Assuming mutually exclusive and independent mean the same thing. Mutually exclusive means $P(A \\cap B) = 0$.",
    sampleQuestion: "Given $P(A) = 0.4$, $P(B) = 0.5$ and $P(A \\cup B) = 0.7$. Are $A$ and $B$ independent?",
    sampleSolution: "$P(A \\cap B) = P(A) + P(B) - P(A \\cup B) = 0.4 + 0.5 - 0.7 = 0.2$.\nCheck: $P(A) \\cdot P(B) = 0.4 \\cdot 0.5 = 0.2$.\nSince $P(A \\cap B) = P(A) \\cdot P(B)$, events $A$ and $B$ ARE independent."
  },
  {
    id: "syl-counting-permutations",
    title: "Fundamental Counting Principle & Permutations",
    strand: "Probability",
    paper: "Paper 1",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "8-12 Marks in Paper 1",
    difficulty: "Intermediate",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Multiplication rule $m \\times n$ choices",
      "Factorial notation $n! = n \\times (n-1) \\times ... \\times 1$",
      "Arrangements with repetition allowed vs not allowed",
      "Grouped items (treating a pair or block as a single entity)",
      "Calculating probability using counting principles"
    ],
    keyFormulae: [
      "n! = n(n-1)(n-2) \\dots 1",
      "\\text{Arrangements with duplicates} = \\frac{n!}{n_1! \\cdot n_2!}",
      "\\text{Block method} = (\\text{Grouped Block}! \\times \\text{Internal Block}!)"
    ],
    examTip: "If $2$ specific people MUST sit together out of $6$, glue them together as $1$ super-person! Now arrange $5$ items ($5!$), then multiply by $2!$ for internal order: $5! \\times 2!$.",
    commonMistakes: "Forgetting to divide by repeating letter factorials when arranging words with identical letters (e.g. AMARIS has 2 A's: $\\frac{6!}{2!}$).",
    sampleQuestion: "How many different 5-letter arrangements can be made using letters from 'SMART' without repetition?",
    sampleSolution: "5 distinct letters: $5! = 5 \\times 4 \\times 3 \\times 2 \\times 1 = 120$ unique arrangements."
  },

  // ----------------------------------------------------
  // PAPER 2: ANALYTICAL GEOMETRY
  // ----------------------------------------------------
  {
    id: "syl-analytical-lines-inclination",
    title: "Distance, Midpoint, Gradient & Angle of Inclination",
    strand: "Analytical Geometry",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "15-20 Marks in Paper 2",
    difficulty: "Core",
    estimatedStudyTime: "3 Hours",
    subtopics: [
      "Distance formula $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$",
      "Midpoint $M\\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$",
      "Gradient $m = \\frac{y_2-y_1}{x_2-x_1}$",
      "Parallel ($m_1 = m_2$) & perpendicular ($m_1 \\cdot m_2 = -1$) lines",
      "Angle of inclination $\\tan \\theta = m$"
    ],
    keyFormulae: [
      "d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}",
      "M\\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)",
      "m = \\tan \\theta \\implies \\theta = \\tan^{-1}(m)",
      "m_1 \\cdot m_2 = -1 \\quad (\\text{Perpendicular Lines})"
    ],
    examTip: "If gradient $m < 0$, $\\tan \\theta = m$ gives a negative reference angle. Add $180^\\circ$ to obtain the positive inclination angle $\\theta$ from the positive $x$-axis!",
    commonMistakes: "Mixing up $x$ and $y$ coordinates in the slope or midpoint formulas.",
    sampleQuestion: "Find the inclination angle of the line passing through $(1, 2)$ and $(4, 7)$.",
    sampleSolution: "Gradient $m = \\frac{7 - 2}{4 - 1} = \\frac{5}{3}$.\n$\\tan \\theta = \\frac{5}{3} \\implies \\theta = \\tan^{-1}\\left(\\frac{5}{3}\\right) = 59.04^\\circ$."
  },
  {
    id: "syl-analytical-circle-equations",
    title: "Circle Equations, Centers & Tangents to Circles",
    strand: "Analytical Geometry",
    paper: "Paper 2",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "20-25 Marks in Paper 2",
    difficulty: "High Yield",
    estimatedStudyTime: "4 Hours",
    subtopics: [
      "Standard circle $(x - a)^2 + (y - b)^2 = r^2$",
      "Completing square to find center $(a, b)$ and radius $r$ from $x^2 + y^2 + Ax + By + C = 0$",
      "Radius-tangent perpendicularity property",
      "Finding equation of tangent line to circle at point $P(x_1, y_1)$",
      "Intersection of lines and circles / non-intersecting conditions"
    ],
    keyFormulae: [
      "(x - a)^2 + (y - b)^2 = r^2",
      "m_{\\text{tangent}} = -\\frac{1}{m_{\\text{radius}}}",
      "d_{\\text{center to line}} = r \\implies \\text{Tangent Line}"
    ],
    examTip: "To find the equation of a tangent to a circle: 1. Find radius gradient $m_r$ from center to contact point. 2. Tangent gradient $m_t = -\\frac{1}{m_r}$. 3. Use $y - y_1 = m_t(x - x_1)$!",
    commonMistakes: "Forgetting to square root $r^2$ when asked for the radius $r$.",
    sampleQuestion: "Circle has equation $x^2 - 6x + y^2 + 8y = 0$. Find center and radius.",
    sampleSolution: "Complete squares: $(x^2 - 6x + 9) + (y^2 + 8y + 16) = 25 \\implies (x - 3)^2 + (y + 4)^2 = 25$. Center $(3, -4)$, Radius $r = 5$."
  },

  // ----------------------------------------------------
  // TRIGONOMETRY
  // ----------------------------------------------------
  {
    id: "syl-trig-reductions-special-angles",
    title: "Trigonometric Reductions, Special Angles & CAST Diagram",
    strand: "Trigonometry",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "15-18 Marks in Paper 2",
    difficulty: "Core",
    estimatedStudyTime: "3 Hours",
    subtopics: [
      "CAST diagram & quadrant signs",
      "Reductions: $180^\\circ \\pm \\theta$, $360^\\circ - \\theta$, $-\\theta$",
      "Co-functions: $\\sin(90^\\circ - \\theta) = \\cos \\theta$, $\\cos(90^\\circ - \\theta) = \\sin \\theta$",
      "Special angle values without calculator ($0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$)",
      "Simplifying complex trigonometric rational expressions"
    ],
    keyFormulae: [
      "\\sin(180^\\circ - \\theta) = \\sin \\theta",
      "\\cos(180^\\circ - \\theta) = -\\cos \\theta",
      "\\sin(90^\\circ - \\theta) = \\cos \\theta",
      "\\cos(-\\theta) = \\cos \\theta"
    ],
    examTip: "Remember: $\\cos(-\\theta) = +\\cos \\theta$ (even function), whereas $\\sin(-\\theta) = -\\sin \\theta$ and $\\tan(-\\theta) = -\\tan \\theta$ (odd functions)!",
    commonMistakes: "Forgetting quadrant signs when reducing terms like $\\tan(180^\\circ + \\theta) = +\\tan \\theta$ vs $\\cos(180^\\circ + \\theta) = -\\cos \\theta$.",
    sampleQuestion: "Simplify without a calculator: $\\frac{\\sin(180^\\circ - x) \\cdot \\cos(90^\\circ - x)}{\\tan(180^\\circ + x)}$.",
    sampleSolution: "$= \\frac{\\sin x \\cdot \\sin x}{\\tan x} = \\frac{\\sin^2 x}{\\frac{\\sin x}{\\cos x}} = \\sin x \\cdot \\cos x$."
  },
  {
    id: "syl-trig-identities-proofs",
    title: "Fundamental Trigonometric Identities & Algebraic Proofs",
    strand: "Trigonometry",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "10-14 Marks in Paper 2",
    difficulty: "Intermediate",
    estimatedStudyTime: "3 Hours",
    subtopics: [
      "Quotient identity $\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta}$",
      "Pythagorean identity $\\sin^2 \\theta + \\cos^2 \\theta = 1$",
      "Rearrangements $\\sin^2 \\theta = 1 - \\cos^2 \\theta$ and $\\cos^2 \\theta = 1 - \\sin^2 \\theta$",
      "Proving $\\text{LHS} = \\text{RHS}$ trigonometric identities",
      "Factoring quadratic trigonometric expressions"
    ],
    keyFormulae: [
      "\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta}",
      "\\sin^2 \\theta + \\cos^2 \\theta = 1",
      "1 - \\sin^2 \\theta = \\cos^2 \\theta"
    ],
    examTip: "To prove $\\text{LHS} = \\text{RHS}$: Work on $\\text{LHS}$ and $\\text{RHS}$ separately! Convert all $\\tan \\theta$ terms into $\\frac{\\sin \\theta}{\\cos \\theta}$, then find a common denominator.",
    commonMistakes: "Writing $\\sin^2 \\theta + \\cos^2 \\theta = \\tan^2 \\theta$ or cancelling terms across addition/subtraction signs.",
    sampleQuestion: "Prove the identity: $\\frac{1 - \\cos^2 x}{\\sin x} = \\sin x$.",
    sampleSolution: "\\text{LHS} = \\frac{\\sin^2 x}{\\sin x} = \\sin x = \\text{RHS. Q.E.D.}"
  },
  {
    id: "syl-trig-compound-double-angles",
    title: "Compound Angle & Double Angle Identities",
    strand: "Trigonometry",
    paper: "Paper 2",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "18-22 Marks in Paper 2",
    difficulty: "High Yield",
    estimatedStudyTime: "4 Hours",
    subtopics: [
      "Compound sine formulas $\\sin(\\alpha \\pm \\beta) = \\sin \\alpha \\cos \\beta \\pm \\cos \\alpha \\sin \\beta$",
      "Compound cosine formulas $\\cos(\\alpha \\pm \\beta) = \\cos \\alpha \\cos \\beta \\mp \\sin \\alpha \\sin \\beta$",
      "Double angle sine formula $\\sin 2\\theta = 2 \\sin \\theta \\cos \\theta$",
      "Double angle cosine formulas $\\cos 2\\theta = \\cos^2 \\theta - \\sin^2 \\theta = 2\\cos^2 \\theta - 1 = 1 - 2\\sin^2 \\theta$",
      "Deriving special angle values (e.g. $\\cos 15^\\circ, \\sin 75^\\circ$)"
    ],
    keyFormulae: [
      "\\cos(\\alpha \\pm \\beta) = \\cos \\alpha \\cos \\beta \\mp \\sin \\alpha \\sin \\beta",
      "\\sin(\\alpha \\pm \\beta) = \\sin \\alpha \\cos \\beta \\pm \\cos \\alpha \\sin \\beta",
      "\\sin 2\\theta = 2 \\sin \\theta \\cos \\theta",
      "\\cos 2\\theta = 2\\cos^2 \\theta - 1 = 1 - 2\\sin^2 \\theta"
    ],
    examTip: "For $\\cos 2\\theta$, pick the variation that helps simplify your equation! If equation has $\\sin \\theta$, use $1 - 2\\sin^2 \\theta$. If it has $\\cos \\theta$, use $2\\cos^2 \\theta - 1$.",
    commonMistakes: "Writing $\\sin 2\\theta$ as $2 \\sin \\theta$ or $\\cos(\\alpha + \\beta)$ as $\\cos \\alpha + \\cos \\beta$.",
    sampleQuestion: "Evaluate $\\cos 15^\\circ$ without a calculator.",
    sampleSolution: "\\cos(45^\\circ - 30^\\circ) = \\cos 45^\\circ \\cos 30^\\circ + \\sin 45^\\circ \\sin 30^\\circ = \\left(\\frac{\\sqrt{2}}{2}\\right)\\left(\\frac{\\sqrt{3}}{2}\\right) + \\left(\\frac{\\sqrt{2}}{2}\\right)\\left(\\frac{1}{2}\\right) = \\frac{\\sqrt{6} + \\sqrt{2}}{4}$."
  },
  {
    id: "syl-trig-general-solutions",
    title: "Trigonometric Equations & General Solutions",
    strand: "Trigonometry",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "12-16 Marks in Paper 2",
    difficulty: "High Yield",
    estimatedStudyTime: "3-4 Hours",
    subtopics: [
      "Finding reference angle $\\theta_{\\text{ref}}$ using $\\tan^{-1}$ / $\\sin^{-1}$ / $\\cos^{-1}$",
      "General solutions for sine: $\\theta = \\theta_{\\text{ref}} + k \\cdot 360^\\circ$ or $\\theta = (180^\\circ - \\theta_{\\text{ref}}) + k \\cdot 360^\\circ$",
      "General solutions for cosine: $\\theta = \\pm \\theta_{\\text{ref}} + k \\cdot 360^\\circ$",
      "General solutions for tangent: $\\theta = \\theta_{\\text{ref}} + k \\cdot 180^\\circ$",
      "Specific solutions within restricted intervals $[a, b]$ for $k \\in \\mathbb{Z}$"
    ],
    keyFormulae: [
      "\\sin \\theta = c \\implies \\theta = \\theta_{\\text{ref}} + k \\cdot 360^\\circ \\quad \\text{or} \\quad \\theta = (180^\\circ - \\theta_{\\text{ref}}) + k \\cdot 360^\\circ",
      "\\cos \\theta = c \\implies \\theta = \\pm \\theta_{\\text{ref}} + k \\cdot 360^\\circ",
      "\\tan \\theta = c \\implies \\theta = \\theta_{\\text{ref}} + k \\cdot 180^\\circ \\quad (k \\in \\mathbb{Z})"
    ],
    examTip: "Always write '$k \\in \\mathbb{Z}$' at the end of every general solution! You will lose $1$ mark if '$k \\in \\mathbb{Z}$' is omitted.",
    commonMistakes: "Forgetting the second quadrant branch for sine equations.",
    sampleQuestion: "Solve for $\\theta$: $2 \\sin \\theta + 1 = 0$ for $\\theta \\in [-180^\\circ, 180^\\circ]$.",
    sampleSolution: "\\sin \\theta = -0.5 \\implies \\theta_{\\text{ref}} = 30^\\circ$.\nQuad 3: $180^\\circ + 30^\\circ = 210^\\circ \\equiv -150^\\circ$.\nQuad 4: $360^\\circ - 30^\\circ = 330^\\circ \\equiv -30^\\circ$.\nSpecific solutions: $\\theta = -150^\\circ$ or $\\theta = -30^\\circ$."
  },
  {
    id: "syl-trig-graphs-transformations",
    title: "Trigonometric Graphs & Transformations",
    strand: "Trigonometry",
    paper: "Paper 2",
    grade: "Grade 10",
    syllabus: "Both",
    examWeightage: "10-14 Marks in Paper 2",
    difficulty: "Intermediate",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Parent curves $y = \\sin x$, $y = \\cos x$, $y = \\tan x$",
      "Amplitude modification $y = a \\sin x$",
      "Period modification $y = \\sin(bx)$ (Period $= \\frac{360^\\circ}{b}$)",
      "Phase shifts $y = \\sin(x - p)$ & vertical shifts $y = \\sin x + q$",
      "Intersections of trig graphs & vertical distance between curves"
    ],
    keyFormulae: [
      "\\text{Period of } \\sin(bx) / \\cos(bx) = \\frac{360^\\circ}{b}",
      "\\text{Period of } \\tan(bx) = \\frac{180^\\circ}{b}",
      "\\text{Amplitude} = \\frac{\\text{Max} - \\text{Min}}{2}"
    ],
    examTip: "For tangent graphs, draw vertical asymptotes at $x = 90^\\circ + k \\cdot 180^\\circ$ as dashed lines! Tangent amplitude is undefined.",
    commonMistakes: "Confusing phase shift direction: $y = \\sin(x - 30^\\circ)$ shifts RIGHT by $30^\\circ$.",
    sampleQuestion: "State the period and amplitude of $y = -3 \\cos(2x)$.",
    sampleSolution: "\\text{Amplitude} = |-3| = 3$.\n\\text{Period} = \\frac{360^\\circ}{2} = 180^\\circ$."
  },
  {
    id: "syl-trig-2d-3d-sine-cosine-rule",
    title: "2D & 3D Trigonometry (Sine, Cosine & Area Rules)",
    strand: "Trigonometry",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "15-20 Marks in Paper 2",
    difficulty: "Advanced",
    estimatedStudyTime: "4 Hours",
    subtopics: [
      "Sine Rule: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$",
      "Cosine Rule: $a^2 = b^2 + c^2 - 2bc \\cos A$",
      "Area Rule: $\\text{Area} = \\frac{1}{2}ab \\sin C$",
      "3D trigonometry across horizontal & vertical planes",
      "Expressing side lengths in terms of variable angles (e.g. $\\theta, \\alpha$)"
    ],
    keyFormulae: [
      "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}",
      "a^2 = b^2 + c^2 - 2bc \\cos A",
      "\\text{Area} = \\frac{1}{2}ab \\sin C"
    ],
    examTip: "Use Sine Rule when you know an OPPOSITE angle-side pair. Use Cosine Rule when you know 3 sides (SSS) OR 2 sides and the INCLUDED angle (SAS)!",
    commonMistakes: "Mixing up horizontal ground plane angles with vertical elevation angles in 3D problems.",
    sampleQuestion: "In $\\Delta ABC$, $a = 7$, $b = 5$, $C = 60^\\circ$. Calculate $c$.",
    sampleSolution: "$c^2 = 7^2 + 5^2 - 2(7)(5) \\cos 60^\\circ = 49 + 25 - 70(0.5) = 74 - 35 = 39 \\implies c = \\sqrt{39} \\approx 6.24$."
  },

  // ----------------------------------------------------
  // EUCLIDEAN GEOMETRY
  // ----------------------------------------------------
  {
    id: "syl-euclidean-circle-center",
    title: "Euclidean Circle Geometry: Center Theorems",
    strand: "Euclidean Geometry",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "15-20 Marks in Paper 2",
    difficulty: "High Yield",
    estimatedStudyTime: "4 Hours",
    subtopics: [
      "Line from center $\\perp$ to chord bisects chord (and converse)",
      "Angle at center $= 2 \\times$ angle at circumference",
      "Angle in semi-circle $= 90^\\circ$ (diameter subtends $90^\\circ$)",
      "Angles subtended by same arc / chord in same segment are equal",
      "Writing official CAPS geometry reasons in examination proofs"
    ],
    keyFormulae: [
      "\\text{Reason: line from center } \\perp \\text{ to chord}",
      "\\text{Reason: } \\angle \\text{ at center } = 2 \\times \\angle \\text{ at circumf}",
      "\\text{Reason: } \\angle \\text{ in semi circle}",
      "\\text{Reason: } \\angle s \\text{ in same segment}"
    ],
    examTip: "You MUST state the exact official NSC/IEB abbreviation for reasons! E.g. write 'line from centre $\\perp$ to chord' or '$\\angle$ at centre $= 2 \\times \\angle$ at circumf'.",
    commonMistakes: "Assuming a line passes through the center without it explicitly being stated or proven as a diameter.",
    sampleQuestion: "$O$ is center of circle. $\\angle AOB = 110^\\circ$. Find $\\angle ACB$ at circumference.",
    sampleSolution: "$\\angle ACB = \\frac{110^\\circ}{2} = 55^\\circ$. Reason: $\\angle \\text{ at center } = 2 \\times \\angle \\text{ at circumf}$."
  },
  {
    id: "syl-euclidean-cyclic-quads",
    title: "Circle Geometry: Cyclic Quadrilaterals & Exterior Angles",
    strand: "Euclidean Geometry",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "15-20 Marks in Paper 2",
    difficulty: "High Yield",
    estimatedStudyTime: "4 Hours",
    subtopics: [
      "Opposite angles of cyclic quad are supplementary (sum $= 180^\\circ$)",
      "Exterior angle of cyclic quad $=$ interior opposite angle",
      "Proving a 4-sided figure is a cyclic quad (converse theorems)",
      "Concyclic points & equal angles subtended by same line segment"
    ],
    keyFormulae: [
      "\\text{Reason: opp } \\angle s \\text{ of cyclic quad}",
      "\\text{Reason: ext } \\angle \\text{ of cyclic quad}",
      "\\text{Reason: conv opp } \\angle s \\text{ of cyclic quad}"
    ],
    examTip: "To prove $ABCD$ is a cyclic quad, choose 1 of 3 strategies: 1. Prove opp $\\angle s$ add to $180^\\circ$. 2. Prove ext $\\angle =$ int opp $\\angle$. 3. Prove line segment subtends equal angles at 2 vertices!",
    commonMistakes: "Claiming opp $\\angle s$ of cyclic quad are EQUAL instead of SUPPLEMENTARY (add to $180^\\circ$).",
    sampleQuestion: "In cyclic quad $ABCD$, $\\angle A = 2x + 10^\\circ$ and $\\angle C = 3x - 30^\\circ$. Solve for $x$.",
    sampleSolution: "$(2x + 10^\\circ) + (3x - 30^\\circ) = 180^\\circ \\implies 5x - 20^\\circ = 180^\\circ \\implies 5x = 200^\\circ \\implies x = 40^\\circ$. Reason: opp $\\angle s$ of cyclic quad."
  },
  {
    id: "syl-euclidean-tangents",
    title: "Circle Geometry: Tangent Theorems & Tan-Chord Theorem",
    strand: "Euclidean Geometry",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "15-20 Marks in Paper 2",
    difficulty: "High Yield",
    estimatedStudyTime: "4 Hours",
    subtopics: [
      "Tangent is $\\perp$ to radius / diameter at point of contact",
      "Tangents drawn from same external point are equal in length",
      "Tan-Chord Theorem (angle between tangent and chord $=$ angle in alt segment)",
      "Converse Tan-Chord Theorem for proving lines are tangents"
    ],
    keyFormulae: [
      "\\text{Reason: tan } \\perp \\text{ radius}",
      "\\text{Reason: tans from same pt}",
      "\\text{Reason: tan chord theorem}"
    ],
    examTip: "The Tan-Chord Theorem is the #1 tested geometry theorem! Look for a tangent line touchpoint, trace the chord, and jump across to the opposite circumf angle.",
    commonMistakes: "Applying tan-chord theorem to a line that is a secant (cuts through circle) rather than a tangent.",
    sampleQuestion: "Line $PT$ is tangent at $T$. Chord $TA$ subtends $\\angle TBA = 48^\\circ$ at circumference. Find $\\angle ATP$.",
    sampleSolution: "$\\angle ATP = 48^\\circ$. Reason: tan chord theorem."
  },
  {
    id: "syl-euclidean-proportionality-similarity",
    title: "Proportionality Theorem & Similar Triangles",
    strand: "Euclidean Geometry",
    paper: "Paper 2",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "18-24 Marks in Paper 2",
    difficulty: "Advanced",
    estimatedStudyTime: "5 Hours",
    subtopics: [
      "Line parallel to one side of triangle divides other two sides proportionally",
      "Proof of Proportionality Theorem (area ratio method)",
      "Equiangular triangles are similar ($|||$)",
      "Proportional side ratios of similar triangles (e.g. $\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF}$)",
      "Pythagorean Theorem proof using triangle similarity"
    ],
    keyFormulae: [
      "\\text{Reason: line } || \\text{ to one side of } \\Delta",
      "\\text{Reason: } ||| \\ \\Delta s \\quad (\\angle \\angle \\angle)",
      "\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF}"
    ],
    examTip: "When proving similarity $\\Delta ABC ||| \\Delta DEF$, write vertices in exact matching angle order! This makes writing side ratios effortless: $\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF}$.",
    commonMistakes: "Inverting ratios when setting up proportions from parallel lines.",
    sampleQuestion: "In $\\Delta ABC$, $DE || BC$ with $D$ on $AB$ and $E$ on $AC$. $AD = 4$, $DB = 6$, $AE = 6$. Find $EC$.",
    sampleSolution: "$\\frac{AD}{DB} = \\frac{AE}{EC} \\implies \\frac{4}{6} = \\frac{6}{EC} \\implies 4 EC = 36 \\implies EC = 9$. Reason: line $||$ to one side of $\\Delta$."
  },

  // ----------------------------------------------------
  // STATISTICS & DATA HANDLING
  // ----------------------------------------------------
  {
    id: "syl-statistics-univariate-ogive",
    title: "Univariate Data, Measures of Dispersion & Ogives",
    strand: "Statistics",
    paper: "Paper 2",
    grade: "Grade 11",
    syllabus: "Both",
    examWeightage: "10-12 Marks in Paper 2",
    difficulty: "Core",
    estimatedStudyTime: "2-3 Hours",
    subtopics: [
      "Mean $\\bar{x}$, Median, Mode & Modal class",
      "Range, Interquartile Range $IQR = Q_3 - Q_1$ & Semi-IQR",
      "Five-number summary & Box-and-Whisker plots",
      "Variance & Standard Deviation $\\sigma$",
      "Cumulative frequency tables & Ogive curves (S-curves)"
    ],
    keyFormulae: [
      "\\bar{x} = \\frac{\\sum x}{n}",
      "IQR = Q_3 - Q_1",
      "\\sigma = \\sqrt{\\frac{\\sum (x - \\bar{x})^2}{n}}",
      "\\text{Outlier} < Q_1 - 1.5(IQR) \\quad \\text{or} > Q_3 + 1.5(IQR)"
    ],
    examTip: "To plot an Ogive curve: ALWAYS plot cumulative frequencies against the UPPER CLASS LIMIT of each interval, starting at (lower limit of 1st interval, 0)!",
    commonMistakes: "Plotting cumulative frequency against class midpoints instead of upper limits.",
    sampleQuestion: "$Q_1 = 30$, $Q_3 = 70$. Is data point $x = 135$ an outlier?",
    sampleSolution: "$IQR = 70 - 30 = 40$.\nUpper fence $= Q_3 + 1.5(IQR) = 70 + 1.5(40) = 130$.\nSince $135 > 130$, $x = 135$ IS an outlier."
  },
  {
    id: "syl-statistics-bivariate-regression",
    title: "Bivariate Data, Least Squares Regression & Correlation ($r$)",
    strand: "Statistics",
    paper: "Paper 2",
    grade: "Grade 12",
    syllabus: "Both",
    examWeightage: "10-12 Marks in Paper 2",
    difficulty: "Core",
    estimatedStudyTime: "2 Hours",
    subtopics: [
      "Scatter plots & bivariate data relationships",
      "Least squares regression line $\\hat{y} = a + bx$ using calculator STAT mode",
      "Pearson's correlation coefficient $r$ ($-1 \\le r \\le 1$)",
      "Interpreting strength & direction of linear correlation",
      "Predicting values (interpolation vs extrapolation)"
    ],
    keyFormulae: [
      "\\hat{y} = a + bx \\quad \\text{(Regression Line)}",
      "b = \\frac{\\sum (x - \\bar{x})(y - \\bar{y})}{\\sum (x - \\bar{x})^2}",
      "-1 \\le r \\le 1"
    ],
    examTip: "Make sure you master STAT mode on your Casio fx-82ZA PLUS / fx-991ZA calculator to compute $a$, $b$, and $r$ in under 30 seconds!",
    commonMistakes: "Mixing up $a$ ($y$-intercept) and $b$ (slope) on Casio calculators where $y = A + Bx$.",
    sampleQuestion: "Regression equation $\\hat{y} = 12 + 2.5x$ with $r = 0.94$. Predict $y$ when $x = 10$.",
    sampleSolution: "$\\hat{y} = 12 + 2.5(10) = 12 + 25 = 37$.\nSince $r = 0.94$ is close to $+1$, there is a strong positive linear correlation."
  },

  // ----------------------------------------------------
  // AP MATHEMATICS & ENRICHMENT
  // ----------------------------------------------------
  {
    id: "syl-ap-complex-numbers",
    title: "Complex Numbers, Argand Diagrams & De Moivre's Theorem",
    strand: "AP & Advanced Maths",
    paper: "Both",
    grade: "Grade 12",
    syllabus: "IEB",
    examWeightage: "20 Marks in AP Maths / IEB Paper 1",
    difficulty: "Advanced",
    estimatedStudyTime: "4-5 Hours",
    subtopics: [
      "Imaginary unit $i = \\sqrt{-1}$ and powers of $i$",
      "Cartesian $z = a + bi$ vs Polar form $z = r(\\cos \\theta + i \\sin \\theta) = r e^{i\\theta}$",
      "Argand plane plotting & modulus $|z| = \\sqrt{a^2 + b^2}$",
      "De Moivre's Theorem ($z^n = r^n (\\cos n\\theta + i \\sin n\\theta)$)",
      "Finding $n$-th roots of complex numbers"
    ],
    keyFormulae: [
      "i^2 = -1",
      "z = r(\\cos \\theta + i \\sin \\theta)",
      "[r(\\cos \\theta + i \\sin \\theta)]^n = r^n (\\cos n\\theta + i \\sin n\\theta)",
      "|z| = \\sqrt{a^2 + b^2}"
    ],
    examTip: "Use De Moivre's Theorem to simplify massive exponents like $(1 + i\\sqrt{3})^{12}$ in seconds by converting to polar form first!",
    commonMistakes: "Calculating argument $\\theta$ in wrong quadrant on Argand diagram.",
    sampleQuestion: "Evaluate $(1 + i)^8$ using De Moivre's Theorem.",
    sampleSolution: "$r = \\sqrt{1+1} = \\sqrt{2}$, $\\theta = 45^\\circ = \\frac{\\pi}{4}$.\n$(1+i)^8 = \\left[\\sqrt{2} e^{i \\pi/4}\\right]^8 = (\\sqrt{2})^8 e^{i 2\\pi} = 16(1) = 16$."
  },
  {
    id: "syl-ap-advanced-calculus-integration",
    title: "Advanced Integration Techniques & Partial Fractions",
    strand: "AP & Advanced Maths",
    paper: "Both",
    grade: "Grade 12",
    syllabus: "IEB",
    examWeightage: "25 Marks in AP Maths / IEB Paper 1",
    difficulty: "Advanced",
    estimatedStudyTime: "5 Hours",
    subtopics: [
      "Indefinite & definite integration fundamental theorem",
      "Integration by substitution $u$-$du$",
      "Integration by parts $\\int u \\, dv = uv - \\int v \\, du$",
      "Partial fraction decomposition",
      "First-order separable differential equations $\\frac{dy}{dx} = f(x)g(y)$"
    ],
    keyFormulae: [
      "\\int u \\, dv = uv - \\int v \\, du",
      "\\int \\frac{1}{x} \\, dx = \\ln|x| + C",
      "\\int e^{kx} \\, dx = \\frac{1}{k} e^{kx} + C"
    ],
    examTip: "For integration by parts, choose $u$ using the LIATE rule: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential!",
    commonMistakes: "Forgetting the constant of integration $+ C$ for indefinite integrals.",
    sampleQuestion: "Evaluate $\\int x e^x \\, dx$.",
    sampleSolution: "Let $u = x \\implies du = dx$. $dv = e^x \\, dx \\implies v = e^x$.\n$\\int x e^x \\, dx = x e^x - \\int e^x \\, dx = x e^x - e^x + C = e^x(x - 1) + C$."
  },
  {
    id: "syl-ap-matrices-vectors",
    title: "Matrix Algebra, Determinants & Systems of Equations",
    strand: "AP & Advanced Maths",
    paper: "Both",
    grade: "Grade 12",
    syllabus: "IEB",
    examWeightage: "20 Marks in AP Maths / IEB Paper 1",
    difficulty: "Advanced",
    estimatedStudyTime: "4 Hours",
    subtopics: [
      "Matrix operations (addition, scalar mult, matrix mult)",
      "$2 \\times 2$ and $3 \\times 3$ Determinants $\\det(A)$",
      "Inverse matrices $A^{-1} = \\frac{1}{\\det A} \\text{adj}(A)$",
      "Solving $3 \\times 3$ linear systems via Gaussian elimination / Cramer's rule",
      "2D and 3D vector dot products and cross products"
    ],
    keyFormulae: [
      "\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc",
      "A^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}",
      "A A^{-1} = I"
    ],
    examTip: "A matrix $A$ is singular (has NO inverse) if and only if $\\det(A) = 0$!",
    commonMistakes: "Matrix multiplication is NOT commutative: $AB \\neq BA$ in general.",
    sampleQuestion: "Find inverse of matrix $A = \\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}$.",
    sampleSolution: "$\\det(A) = 2(3) - 1(5) = 6 - 5 = 1$.\n$A^{-1} = \\frac{1}{1} \\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix} = \\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix}$."
  }
];
