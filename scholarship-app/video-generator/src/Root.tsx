import { Composition } from 'remotion';
import { ScholarshipShort, defaultProps } from './ScholarshipShort';

export const Root = () => {
  return (
    <Composition
      id="ScholarshipShort"
      component={ScholarshipShort}
      durationInFrames={900} // 30 seconds at 30 fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};
