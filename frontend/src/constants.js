export const CLASS_META = {
  Early_blight: {
    label: 'Early Blight',
    pathogen: 'Alternaria solani',
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
    bar: 'bg-amber-500',
    description:
      'Dark brown spots with concentric rings and a yellow halo, usually on older leaves.',
  },
  Healthy: {
    label: 'Healthy',
    pathogen: 'No disease detected',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    bar: 'bg-emerald-500',
    description:
      'Uniform green leaf tissue with no visible lesions or discoloration.',
  },
  Late_blight: {
    label: 'Late Blight',
    pathogen: 'Phytophthora infestans',
    badge: 'bg-red-100 text-red-800 ring-red-200',
    bar: 'bg-red-500',
    description:
      'Large water-soaked grey-green patches that spread fast in cool, wet weather.',
  },
}

export const MODEL_RESULTS = [
  {
    model: 'EfficientNetB3 (fine-tuned)',
    accuracy: '99.69%',
    f1: '0.992',
    params: '~11.6M',
    highlight: true,
  },
  {
    model: 'EfficientNetB3 (frozen)',
    accuracy: '98.76%',
    f1: '0.973',
    params: '~11.6M',
  },
  {
    model: 'Custom CNN (scratch)',
    accuracy: '98.45%',
    f1: '0.983',
    params: '1.42M',
  },
  {
    model: 'MobileNetV2 (frozen)',
    accuracy: '97.21%',
    f1: '0.947',
    params: '2.92M',
  },
]

export const SAMPLE_LABELS = {
  'L1.png': 'Healthy',
  'L3.png': 'Healthy',
  'healthy_leaf.png': 'Healthy leaf',
  'healthy_background.png': 'Healthy on soil',
  'blight.png': 'Early blight',
  'late_blight.jpeg': 'Late blight',
  'lifi.jpeg': 'Not a leaf',
}
