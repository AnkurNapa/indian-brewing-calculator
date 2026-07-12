export interface HopVariety {
  id: string;
  name: string;
  /** Typical mid-range alpha acid %, for quick-fill -- always check the actual lot/COA. */
  alphaAcidPercent: number;
}

/** Common brewing hop varieties, for quick-filling a hop addition's name + alpha acid. */
export const HOP_VARIETIES: HopVariety[] = [
  { id: 'cascade', name: 'Cascade', alphaAcidPercent: 5.5 },
  { id: 'centennial', name: 'Centennial', alphaAcidPercent: 10 },
  { id: 'citra', name: 'Citra', alphaAcidPercent: 12 },
  { id: 'simcoe', name: 'Simcoe', alphaAcidPercent: 13 },
  { id: 'amarillo', name: 'Amarillo', alphaAcidPercent: 9 },
  { id: 'mosaic', name: 'Mosaic', alphaAcidPercent: 11.5 },
  { id: 'chinook', name: 'Chinook', alphaAcidPercent: 12 },
  { id: 'columbus', name: 'Columbus / Tomahawk / Zeus (CTZ)', alphaAcidPercent: 15 },
  { id: 'willamette', name: 'Willamette', alphaAcidPercent: 5 },
  { id: 'fuggle', name: 'Fuggle', alphaAcidPercent: 4.5 },
  { id: 'ekg', name: 'East Kent Golding', alphaAcidPercent: 5 },
  { id: 'saaz', name: 'Saaz', alphaAcidPercent: 3.5 },
  { id: 'hallertau-mittelfruh', name: 'Hallertau Mittelfrüh', alphaAcidPercent: 4 },
  { id: 'tettnang', name: 'Tettnang', alphaAcidPercent: 4.5 },
  { id: 'magnum', name: 'Magnum', alphaAcidPercent: 14 },
  { id: 'nugget', name: 'Nugget', alphaAcidPercent: 12.5 },
  { id: 'warrior', name: 'Warrior', alphaAcidPercent: 16 },
  { id: 'galaxy', name: 'Galaxy', alphaAcidPercent: 14 },
  { id: 'nelson-sauvin', name: 'Nelson Sauvin', alphaAcidPercent: 12 },
  { id: 'motueka', name: 'Motueka', alphaAcidPercent: 7 },
  { id: 'sorachi-ace', name: 'Sorachi Ace', alphaAcidPercent: 12 },
  { id: 'perle', name: 'Perle', alphaAcidPercent: 8 },
  { id: 'northern-brewer', name: 'Northern Brewer', alphaAcidPercent: 9 },
  { id: 'crystal', name: 'Crystal', alphaAcidPercent: 4 },
  { id: 'liberty', name: 'Liberty', alphaAcidPercent: 4.5 },
  { id: 'mount-hood', name: 'Mount Hood', alphaAcidPercent: 5.5 },
  { id: 'cluster', name: 'Cluster', alphaAcidPercent: 7 },
  { id: 'summit', name: 'Summit', alphaAcidPercent: 17 },
  { id: 'el-dorado', name: 'El Dorado', alphaAcidPercent: 15 },
  { id: 'idaho-7', name: 'Idaho 7', alphaAcidPercent: 11.5 },
];
