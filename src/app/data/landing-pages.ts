// Configuracion de las paginas de aterrizaje (landing) por categoria y promos.
// Cada banner del home apunta a una ruta propia con hero + listado filtrado.

/**
 * Módulo frontend `landing-pages` (data).
 */
export interface CategoriaLandingConfig {
  slug: string;
  categoriaId: number;
  badge: string;
  titulo: string;
  tituloAccent?: string;
  subtitulo: string;
  imagen: string;
  theme: 'blue' | 'cyan' | 'orange';
  tags?: string[];
}

export interface PromoLandingConfig {
  slug: string;
  titulo: string;
  tituloAccent?: string;
  subtitulo: string;
  theme: 'orange' | 'blue';
  imagen?: string;
  // Si tiene categoriaId filtra por categoria; si no, muestra todo el catalogo.
  categoriaId?: number;
}

export const CATEGORIA_LANDINGS: Record<string, CategoriaLandingConfig> = {
  notebooks: {
    slug: 'notebooks',
    categoriaId: 1,
    badge: '🚀 Recién llegadas',
    titulo: 'Notebooks',
    tituloAccent: 'Gamer',
    subtitulo: 'Potencia para jugar, estudiar y trabajar. RTX, pantallas rápidas y SSD incluidos.',
    imagen: 'https://images.unsplash.com/photo-1560252719-59e35a3bbc6d?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    theme: 'blue',
    tags: ['RTX 4060', '165Hz', '16GB DDR5'],
  },
  perifericos: {
    slug: 'perifericos',
    categoriaId: 2,
    badge: 'Armá tu setup',
    titulo: 'Periféricos',
    tituloAccent: '& Combos',
    subtitulo: 'Teclado, mouse, auriculares y accesorios. Armá tu estación completa.',
    imagen: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    theme: 'blue',
    tags: ['Mecánicos', 'Inalámbricos', 'RGB'],
  },
  monitores: {
    slug: 'monitores',
    categoriaId: 3,
    badge: 'Sin lag · Sin tearing',
    titulo: 'Monitores',
    tituloAccent: 'Gaming',
    subtitulo: '144Hz, 165Hz y 240Hz. Colores nítidos para competir sin tearing.',
    imagen: 'https://images.unsplash.com/photo-1547658718-1cdaa0852790?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    theme: 'cyan',
    tags: ['165Hz', 'IPS', 'Curvo'],
  },
  componentes: {
    slug: 'componentes',
    categoriaId: 4,
    badge: 'Armá tu PC',
    titulo: 'Componentes',
    tituloAccent: 'de alto rendimiento',
    subtitulo: 'Placas de video, procesadores, RAM, motherboards y fuentes certificadas.',
    imagen: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    theme: 'blue',
    tags: ['RTX / RX', 'DDR5', '80 Plus Gold'],
  },
  almacenamiento: {
    slug: 'almacenamiento',
    categoriaId: 5,
    badge: 'Velocidad NVMe',
    titulo: 'Almacenamiento',
    tituloAccent: 'rápido',
    subtitulo: 'SSD, HDD, pendrives y discos externos para upgrades y backups.',
    imagen: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    theme: 'cyan',
    tags: ['PCIe 4.0', '1TB / 2TB', 'Portable'],
  },
  audio: {
    slug: 'audio',
    categoriaId: 6,
    badge: 'Sonido inmersivo',
    titulo: 'Audio',
    tituloAccent: 'profesional',
    subtitulo: 'Auriculares gamer, cancelación de ruido y parlantes para tu escritorio.',
    imagen: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    theme: 'blue',
    tags: ['7.1', 'Bluetooth', 'Micrófono'],
  },
  'sillas-gamer': {
    slug: 'sillas-gamer',
    categoriaId: 7,
    badge: 'Ergonomía premium',
    titulo: 'Sillas',
    tituloAccent: 'Gamer',
    subtitulo: 'Soporte lumbar, reclinables y materiales premium para maratones de juego.',
    imagen: 'https://images.unsplash.com/photo-1580480057633-8b5eb8925d86?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    theme: 'orange',
    tags: ['4D', 'Reclinable', 'Hasta 150kg'],
  },
};

export const PROMO_LANDINGS: Record<string, PromoLandingConfig> = {
  'hot-sale': {
    slug: 'hot-sale',
    titulo: 'HOT',
    tituloAccent: 'SALE',
    subtitulo: 'Hasta 40% OFF en teclados, mouse y periféricos gamer. Oferta por tiempo limitado.',
    theme: 'orange',
    imagen: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    categoriaId: 2,
  },
  'cyber-week': {
    slug: 'cyber-week',
    titulo: 'CYBER',
    tituloAccent: 'WEEK',
    subtitulo: 'Hasta 50% OFF en toda la tecnología. Notebooks, monitores, componentes y más.',
    theme: 'blue',
    imagen: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?fm=jpg&q=80&w=1200&auto=format&fit=crop',
  },
};
