import React, { useLayoutEffect, useRef } from 'react';
import { TextAnimation, type SplitMode } from '../typography/TextAnimation';

interface Props extends React.HTMLAttributes<HTMLElement> { as?: keyof JSX.IntrinsicElements; split?: SplitMode; children: string; reveal?: boolean; }

export function SplitText({ as: Tag = 'span', split = 'words', reveal = true, children, ...props }: Props) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const animation = new TextAnimation();
    animation.register(ref.current, split);
    if (reveal) animation.reveal(ref.current);
    return () => animation.destroy();
  }, [split, reveal]);
  return React.createElement(Tag, { ...props, ref, className: `${props.className ?? ''} split-text` }, children);
}

export function MaskReveal(props: Props) { return <SplitText {...props} />; }
export function CharacterReveal(props: Omit<Props, 'split'>) { return <SplitText {...props} split="characters" />; }
export function WordReveal(props: Omit<Props, 'split'>) { return <SplitText {...props} split="words" />; }
