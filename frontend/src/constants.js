// Per-project configuration for the unified Potato + Papaya demo app.
// Each project carries its own class metadata, copy, and sample labels so the
// shared components can render either model without project-specific branches.

const POTATO_CLASS_META = {
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

const PAPAYA_CLASS_META = {
  Diseased: {
    label: 'Diseased',
    pathogen: 'Visible fruit surface disease',
    badge: 'bg-red-100 text-red-800 ring-red-200',
    bar: 'bg-red-500',
    description:
      'Lesions, discoloration, or rot on the papaya surface consistent with infection.',
  },
  Healthy: {
    label: 'Healthy',
    pathogen: 'No disease detected',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    bar: 'bg-emerald-500',
    description: 'Uniform ripe/ripening skin with no visible lesions or rot.',
  },
}

export const PROJECTS = {
  potato: {
    id: 'potato',
    name: 'Potato',
    emoji: '🥔',
    title: 'Potato Leaf Disease Detector',
    subtitle: 'EfficientNetB3 + Grad-CAM',
    repoUrl: 'https://github.com/SinhaDhruv17/Potato-Leaf-Disease-Detection-DWM',
    classMeta: POTATO_CLASS_META,
    tagline: 'PlantVillage dataset · leak-free split',
    heading: 'Spot potato leaf disease from a single photo',
    bodyPrefix:
      'Upload a leaf image and a fine-tuned EfficientNetB3 classifies it as ',
    highlights: [
      { text: 'Healthy', className: 'text-emerald-700' },
      { text: 'Early Blight', className: 'text-amber-700' },
      { text: 'Late Blight', className: 'text-red-700' },
    ],
    bodySuffix:
      ' — with Grad-CAM highlighting the evidence behind the prediction.',
    stats: [
      { icon: 'target', value: '99.69%', label: 'test-set accuracy' },
      { icon: 'flask', value: '4 models', label: 'compared under one protocol' },
      { icon: 'leaf', value: '3 classes', label: 'Early Blight · Healthy · Late Blight' },
    ],
    uploadTitle: 'Drop a potato leaf image here',
    uploadAria: 'Upload a potato leaf image',
    uploadHint: 'JPG or PNG leaf photo',
    analyzingTitle: 'Analyzing leaf',
    analyzingText:
      'Running EfficientNetB3 and computing Grad-CAM — this can take a few seconds on CPU.',
    idleHint:
      'Upload a leaf photo or pick one of the samples to see the prediction, confidence scores, and the Grad-CAM explanation.',
    sampleGalleryHint: 'from External_Test_Data',
    hasSamples: true,
    about: {
      intro:
        'The deployed model is a fine-tuned EfficientNetB3 with a custom classification head, trained on 3,800 PlantVillage images and evaluated on a held-out test set that was never trained on or augmented.',
      pipeline: [
        { icon: 'scan', title: '1. Upload', text: 'JPG or PNG leaf photo' },
        { icon: 'shrink', title: '2. Resize', text: '300 × 300 pixels, RGB' },
        { icon: 'sliders', title: '3. Preprocess', text: 'EfficientNet scaling to [-1, 1]' },
        { icon: 'brain', title: '4. Classify', text: 'Fine-tuned EfficientNetB3' },
        { icon: 'bars', title: '5. Explain', text: 'Softmax + Grad-CAM heatmap' },
      ],
      modelTableTitle: 'Model comparison',
      modelTableNote: 'Held-out test set (323 images), identical split and training protocol.',
      modelResults: [
        { model: 'EfficientNetB3 (fine-tuned)', accuracy: '99.69%', f1: '0.992', params: '~11.6M', highlight: true },
        { model: 'EfficientNetB3 (frozen)', accuracy: '98.76%', f1: '0.973', params: '~11.6M' },
        { model: 'Custom CNN (scratch)', accuracy: '98.45%', f1: '0.983', params: '1.42M' },
        { model: 'MobileNetV2 (frozen)', accuracy: '97.21%', f1: '0.947', params: '2.92M' },
      ],
      designChoices: [
        'Split before augmentation: the 70/15/15 train/val/test split happens on original images, so augmented copies can never leak across splits.',
        'Only the train split is augmented — flips, ±15°/±25° rotations with reflected borders, brightness changes, and zoom.',
        'Moderate oversampling of the small Healthy class (152 originals to 1000) plus balanced class weights during training.',
        'All four architectures trained under an identical protocol, then evaluated once on the untouched 323-image test set.',
      ],
      limitation:
        'PlantVillage images are captured under lab conditions with uniform backgrounds. Field photos with soil, shadows, or multiple leaves may be harder — try the "Not a leaf" sample to see how the model behaves outside its domain.',
    },
    sampleLabels: {
      'L1.png': 'Healthy',
      'L3.png': 'Healthy',
      'healthy_leaf.png': 'Healthy leaf',
      'healthy_background.png': 'Healthy on soil',
      'blight.png': 'Early blight',
      'late_blight.jpeg': 'Late blight',
      'lifi.jpeg': 'Not a leaf',
    },
    footerTitle: 'Potato Leaf Disease Detection',
    footerCredits:
      'Dhruv Sinha — dataset preparation, model training, evaluation, notebooks, and deployment. Naman — frontend / UI.',
    footerSource:
      'Dataset: PlantVillage — Hughes, D. P., & Salathé, M. (2015). An open access repository of images on plant health to enable the development of mobile disease diagnostics. arXiv:1511.08060.',
  },
  papaya: {
    id: 'papaya',
    name: 'Papaya',
    emoji: '🍈',
    title: 'Papaya Fruit Disease Detector',
    subtitle: 'MobileNetV2 + Grad-CAM',
    repoUrl: 'https://github.com/SinhaDhruv17/Potato-Leaf-Disease-Detection-DWM',
    classMeta: PAPAYA_CLASS_META,
    tagline: 'Papaya fruit dataset · leak-free split',
    heading: 'Flag papaya fruit disease from a single photo',
    bodyPrefix:
      'Upload a papaya fruit image and a fine-tuned MobileNetV2 classifies it as ',
    highlights: [
      { text: 'Healthy', className: 'text-emerald-700' },
      { text: 'Diseased', className: 'text-red-700' },
    ],
    bodySuffix:
      ' — with Grad-CAM highlighting the evidence behind the prediction.',
    stats: [
      { icon: 'flask', value: 'MobileNetV2', label: 'fine-tuned transfer learning' },
      { icon: 'target', value: '2 classes', label: 'Healthy · Diseased' },
      { icon: 'leaf', value: '224 × 224', label: 'MobileNetV2 input resolution' },
    ],
    uploadTitle: 'Drop a papaya fruit image here',
    uploadAria: 'Upload a papaya fruit image',
    uploadHint: 'JPG or PNG fruit photo',
    analyzingTitle: 'Analyzing fruit',
    analyzingText:
      'Running MobileNetV2 and computing Grad-CAM — this can take a few seconds on CPU.',
    idleHint:
      'Upload a papaya fruit photo to see the prediction, confidence scores, and the Grad-CAM explanation.',
    sampleGalleryHint: 'Papaya samples',
    hasSamples: false,
    about: {
      intro:
        'The deployed model is a fine-tuned MobileNetV2 that classifies papaya fruit as Healthy or Diseased. It is the deep-learning branch of a project that also compared classical segmentation and classifiers, evaluated on a held-out test set that was never trained on or augmented.',
      pipeline: [
        { icon: 'scan', title: '1. Upload', text: 'JPG or PNG fruit photo' },
        { icon: 'shrink', title: '2. Resize', text: '224 × 224 pixels, RGB' },
        { icon: 'sliders', title: '3. Preprocess', text: 'MobileNet scaling to [-1, 1]' },
        { icon: 'brain', title: '4. Classify', text: 'Fine-tuned MobileNetV2' },
        { icon: 'bars', title: '5. Explain', text: 'Sigmoid + Grad-CAM heatmap' },
      ],
      modelTableTitle: null,
      modelTableNote: null,
      modelResults: [],
      designChoices: [
        'Split before augmentation: train/test is split on original images, and each original\'s augmented versions stay together on one side, so copies never leak across the split.',
        'Augmentation uses flips (horizontal, vertical, both) and 90°/180°/270° rotations — 7 versions per original image.',
        'Transfer learning from ImageNet: the MobileNetV2 backbone is fine-tuned on papaya fruit rather than trained from scratch.',
        'The deployed head ends in a single sigmoid output, mapped to Healthy vs Diseased probabilities.',
      ],
      limitation:
        'The dataset comes from a limited number of source images under controlled photography conditions. Real-world field photos with variable backgrounds, lighting, and camera quality have not been validated and are expected to score lower.',
    },
    sampleLabels: {},
    footerTitle: 'Papaya Fruit Disease Detection',
    footerCredits:
      'Papaya disease detection — MobileNetV2 transfer learning, trained on Healthy/Diseased papaya fruit images. Naman — frontend / UI.',
    footerSource:
      'Deep-learning branch of the Papaya Fruit Disease Detection project; the classical pipeline compared eight segmentation techniques with seven classifiers.',
  },
}

export const PROJECT_ORDER = ['potato', 'papaya']
