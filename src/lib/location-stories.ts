export type LocationStory = {
  title: string;
  text: string;
  highlights: string[];
};

const BY_AREA: Record<string, LocationStory> = {
  kololo: {
    title: "Kololo — diplomatic & commercial corridor",
    text: "Kololo sits among Kampala’s most established residential and commercial streets, with strong demand for quality office and mixed-use space, solid access routes, and a premium neighbourhood profile.",
    highlights: [
      "Prime central Kampala address",
      "Strong corporate & embassy corridor demand",
      "High visibility for commercial assets",
    ],
  },
  naguru: {
    title: "Naguru — hillside living with city access",
    text: "Naguru combines elevated residential appeal with quick links into the city centre. Apartments here attract professionals seeking views, security, and convenient commuting.",
    highlights: [
      "Hillside residential demand",
      "Close to central Kampala",
      "Strong long-term rental interest",
    ],
  },
  bugolobi: {
    title: "Bugolobi — mixed-use growth strip",
    text: "Bugolobi has matured into a lively mixed-use neighbourhood where retail, offices and apartments sit side by side — ideal for projects designed around daily footfall and local trade.",
    highlights: [
      "Active commercial street frontage",
      "Retail + residential mix",
      "Established urban amenities nearby",
    ],
  },
  muyenga: {
    title: "Muyenga — premium residential hills",
    text: "Muyenga is known for exclusive residential compounds and elevated plots. Villa and high-finish projects here target buyers seeking privacy, views and lasting asset value.",
    highlights: [
      "Premium residential positioning",
      "Private compound living",
      "Strong end-user buyer appeal",
    ],
  },
  entebbe: {
    title: "Entebbe — airport road corridor",
    text: "Entebbe benefits from airport connectivity, lakeside lifestyle demand and steady residential growth along key access roads — attractive for estates and investor housing.",
    highlights: [
      "Airport corridor connectivity",
      "Residential estate demand",
      "Lifestyle & investment appeal",
    ],
  },
  jinja: {
    title: "Jinja — Nile corridor commercial hub",
    text: "Jinja remains Eastern Uganda’s commercial anchor, with the Nile corridor supporting trade, tourism-adjacent business and growing demand for modern commercial shells.",
    highlights: [
      "Eastern Uganda trade hub",
      "Nile corridor visibility",
      "Retail & office opportunity",
    ],
  },
  ntinda: {
    title: "Ntinda — urban residential density",
    text: "Ntinda is a high-activity residential district with strong demand for serviced and multi-unit living, supported by retail strips and easy city links.",
    highlights: [
      "Dense residential demand",
      "Serviced living opportunity",
      "Good city connectivity",
    ],
  },
  kampala: {
    title: "Kampala — capital market depth",
    text: "Kampala offers Uganda’s deepest property market — from commercial cores to expanding residential belts — with demand driven by corporates, professionals and long-term investors.",
    highlights: [
      "Deepest national property market",
      "Corporate & residential demand",
      "Long-term capital growth corridor",
    ],
  },
};

const DEFAULT_STORY: LocationStory = {
  title: "Uganda — strategic growth markets",
  text: "JK Express delivers construction and property projects across Uganda’s key urban and growth corridors, with disciplined site controls and transparent client reporting.",
  highlights: [
    "Urban & growth corridor focus",
    "Disciplined project delivery",
    "Local market expertise",
  ],
};

/** Build a location narrative from project city / address text. */
export function getLocationStory(
  city?: string | null,
  location?: string | null,
): LocationStory {
  const haystack = `${location ?? ""} ${city ?? ""}`.toLowerCase();
  for (const [key, story] of Object.entries(BY_AREA)) {
    if (haystack.includes(key)) return story;
  }
  return DEFAULT_STORY;
}
