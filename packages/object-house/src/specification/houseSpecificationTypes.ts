/**
 * CAP-REF-02 — House Specification schema (CAP-REF-01 §2).
 * House-owned product data. No Project fields. No invented domain values.
 */

export type HouseSpecificationStatus = 'draft' | 'ready' | 'published';

export type HousePriceBasis = 'list' | 'from' | 'onRequest';

/** Inclusive numeric range (delivery / lead-time facts). */
export type HouseNumericRange = {
  readonly min: number;
  readonly max: number;
};

export type HouseDispositionRoom = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly areaM2?: number;
};

export type HouseSpecificationOption = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly priceDelta?: number;
};

export type HousePriceValidity = {
  readonly from?: string;
  readonly to?: string;
};

/** CAP-REF-01 §2.1 — identity (required for a specification document). */
export type HouseSpecificationIdentity = {
  readonly houseId: string;
  readonly name: string;
  readonly slug: string;
  readonly modelCode?: string;
  readonly objectType: string;
  readonly canonicalProjectId: string;
  readonly companyId: string;
  readonly locale?: string;
  readonly status: HouseSpecificationStatus;
  /** Only MODERN 4KK may be `reference` in the CONIS product set. */
  readonly role: 'reference' | 'authored';
};

export type HouseSpecificationDimensions = {
  readonly footprintAreaM2?: number;
  readonly usableAreaM2?: number;
  readonly builtUpAreaM2?: number;
  readonly plotRecommendationM2?: number | HouseNumericRange;
  readonly storeys?: number;
  readonly heightM?: number;
  readonly externalDimensions?: {
    readonly lengthM: number;
    readonly widthM: number;
  };
};

export type HouseSpecificationDisposition = {
  readonly rooms?: readonly HouseDispositionRoom[];
  readonly bedrooms?: number;
  readonly bathrooms?: number;
  readonly layoutCode?: string;
  readonly accessibilityNotes?: string;
};

export type HouseSpecificationConstruction = {
  readonly constructionSystem?: string;
  readonly structure?: string;
  readonly foundations?: string;
  readonly roofType?: string;
  readonly moduleCount?: number;
  readonly assemblyMethod?: string;
};

export type HouseSpecificationEnergy = {
  readonly energyClass?: string;
  readonly primaryEnergyKwhM2a?: number;
  readonly heatingDemand?: string | number;
  readonly renewables?: readonly string[];
  readonly insulationSummary?: string;
};

export type HouseSpecificationTechnologies = {
  readonly hvac?: readonly string[];
  readonly ventilation?: string;
  readonly smartHome?: readonly string[];
  readonly electrical?: string;
  readonly water?: string;
};

export type HouseSpecificationMaterials = {
  readonly primaryMaterials?: readonly string[];
  readonly facade?: string;
  readonly interiorFinishesStandard?: string;
  readonly sustainabilityNotes?: string;
};

export type HouseSpecificationEquipment = {
  readonly includedStandard?: readonly string[];
  readonly excludedFromStandard?: readonly string[];
  readonly kitchen?: string;
  readonly sanitary?: string;
};

export type HouseSpecificationPrice = {
  readonly priceBasis?: HousePriceBasis;
  readonly currency?: string;
  readonly amount?: number;
  readonly priceIncludes?: readonly string[];
  readonly priceExcludes?: readonly string[];
  readonly validity?: HousePriceValidity;
};

export type HouseSpecificationDelivery = {
  readonly leadTimeWeeks?: number | HouseNumericRange;
  readonly onSiteDays?: number | HouseNumericRange;
  readonly transportNotes?: string;
  readonly permitsResponsibility?: string;
  readonly warranty?: string;
};

export type HouseSpecificationVariants = {
  readonly options?: readonly HouseSpecificationOption[];
  readonly variantOfHouseId?: string;
};

export type HouseSpecificationLimitations = {
  readonly limitations?: readonly string[];
  readonly exceptions?: readonly string[];
  readonly siteConstraints?: readonly string[];
};

/**
 * Complete House Specification document (CAP-REF-01 §2).
 * Optional product categories may be omitted entirely.
 */
export type HouseSpecification = {
  readonly identity: HouseSpecificationIdentity;
  readonly dimensions?: HouseSpecificationDimensions;
  readonly disposition?: HouseSpecificationDisposition;
  readonly construction?: HouseSpecificationConstruction;
  readonly energy?: HouseSpecificationEnergy;
  readonly technologies?: HouseSpecificationTechnologies;
  readonly materials?: HouseSpecificationMaterials;
  readonly equipment?: HouseSpecificationEquipment;
  readonly price?: HouseSpecificationPrice;
  readonly delivery?: HouseSpecificationDelivery;
  readonly variants?: HouseSpecificationVariants;
  readonly limitations?: HouseSpecificationLimitations;
};

/** Canonical Reference House ids (CAP-REF-01 / CAP-PLAT-04A). */
export const REFERENCE_HOUSE_ID = 'modern-4kk' as const;
export const REFERENCE_HOUSE_NAME = 'MODERN 4KK' as const;
export const REFERENCE_HOUSE_SLUG = 'modern-4kk' as const;
export const REFERENCE_PROJECT_ID = 'project-domy-s-energii' as const;
export const REFERENCE_COMPANY_ID = 'company-domy-s-energii' as const;
