export type ConstructionService = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  image: string;
  deliverables: string[];
  applications: string[];
};

export const CONSTRUCTION_SERVICES: ConstructionService[] = [
  {
    slug: "building-construction",
    number: "01",
    title: "Building and construction works",
    shortTitle: "Building & construction",
    summary: "New builds, extensions and refurbishment from mobilisation through handover.",
    description: "JK Express delivers residential, commercial and institutional buildings with coordinated design, controlled procurement, supervised site execution and documented quality checks.",
    image: "/site-photos/site-01.jpeg",
    deliverables: ["Pre-construction planning and mobilisation", "Structural and architectural works", "Mechanical and electrical coordination", "Finishes, external works and handover"],
    applications: ["Private residences", "Apartments and estates", "Offices and retail", "Schools and institutional buildings"],
  },
  {
    slug: "retaining-structures",
    number: "02",
    title: "Retaining structures and slope works",
    shortTitle: "Retaining structures",
    summary: "Gabions, reinforced retaining solutions, drainage and erosion-control works.",
    description: "We construct site-specific retaining and slope-protection systems, coordinating earthworks, drainage, reinforcement and durable finishes around the actual ground conditions.",
    image: "/site-photos/site-06.jpeg",
    deliverables: ["Gabion retaining walls", "Reinforced concrete retaining walls", "Slope drainage and stabilisation", "Erosion protection and reinstatement"],
    applications: ["Road and access works", "Hillside developments", "Boundary support", "Drainage and watercourse protection"],
  },
  {
    slug: "specialist-works",
    number: "03",
    title: "Specialist construction works",
    shortTitle: "Specialist works",
    summary: "Aluminium, gypsum, ceilings, joinery and specialist finishing packages.",
    description: "Our specialist packages give clients one accountable team for detailed interior and envelope work that must integrate cleanly with the main structure and services.",
    image: "/site-photos/site-11.jpeg",
    deliverables: ["Aluminium and glazing", "Gypsum partitions and ceilings", "Carpentry and fitted joinery", "Special finishes and remedial works"],
    applications: ["Office fit-outs", "Retail interiors", "Residential finishes", "Institutional refurbishment"],
  },
  {
    slug: "construction-materials",
    number: "04",
    title: "Specialist construction materials",
    shortTitle: "Materials supply",
    summary: "Specified materials sourced and supplied with practical site guidance.",
    description: "JK Express supports projects with specialist construction inputs selected against the application, programme and specification—not simply supplied as undifferentiated stock.",
    image: "/site-photos/site-12.jpeg",
    deliverables: ["Waterproofing systems", "Concrete repair and jointing materials", "Protective coatings and membranes", "Geosynthetics and drainage materials"],
    applications: ["Basements and roofs", "Water-retaining structures", "Concrete repairs", "Roads, drainage and earthworks"],
  },
  {
    slug: "scaffolding-formwork",
    number: "05",
    title: "Scaffolding and formwork support",
    shortTitle: "Scaffolding & formwork",
    summary: "Access, falsework and formwork support supplied, erected and inspected.",
    description: "We provide practical access and temporary-works support for construction sites, with layouts coordinated to the work face, loading requirements and safe movement on site.",
    image: "/site-photos/site-05.jpeg",
    deliverables: ["Scaffolding supply and erection", "Formwork and falsework support", "Access boards, ladders and edge protection", "Inspection, adjustment and dismantling"],
    applications: ["Concrete frames", "Facade and finishing works", "Maintenance access", "Water tanks and civil structures"],
  },
  {
    slug: "waterproofing",
    number: "06",
    title: "Waterproofing and damp control",
    shortTitle: "Waterproofing",
    summary: "Diagnosis and treatment for roofs, basements, wet areas and concrete structures.",
    description: "Our waterproofing work starts with diagnosis. We match preparation, detailing and the selected system to the source of ingress, then document application and testing.",
    image: "/site-photos/site-10.jpeg",
    deliverables: ["Roof and balcony waterproofing", "Basement and retaining-wall protection", "Wet-area and water-tank systems", "Rising damp and remedial treatment"],
    applications: ["Flat roofs and terraces", "Basements", "Bathrooms and kitchens", "Reservoirs and water-retaining structures"],
  },
];

export function getConstructionService(slug: string) {
  return CONSTRUCTION_SERVICES.find((service) => service.slug === slug);
}
