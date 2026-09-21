export interface ExpertiseMode {
  id: 'strategy' | 'creative' | 'tech' | 'production';
  label: string;
  title: string;
  description: string;
  accent: string;
  scene: 'strategy' | 'creative' | 'tech' | 'production';
}

export const expertiseModes: ExpertiseMode[] = [
  { id: 'strategy', label: 'Strategy', title: 'Start with why.', description: 'Positioning, research and a clear point of view. We find the signal before we shape the form.', accent: '#8ea4ff', scene: 'strategy' },
  { id: 'creative', label: 'Creative', title: 'Make it matter.', description: 'Art direction, identity, campaigns and worlds with enough character to become memorable.', accent: '#d69aff', scene: 'creative' },
  { id: 'tech', label: 'Tech', title: 'Build the impossible.', description: 'Code, WebGL and intelligent systems turn a strong idea into an experience you can feel.', accent: '#63e6d7', scene: 'tech' },
  { id: 'production', label: 'Production', title: 'Make the moment.', description: 'From prototype to launch, our producers keep the details moving and the ambition intact.', accent: '#ffb46b', scene: 'production' },
];
