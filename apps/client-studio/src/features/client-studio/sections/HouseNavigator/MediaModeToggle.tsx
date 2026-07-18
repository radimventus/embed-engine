import { useWalkthrough } from '../../../walkthrough';
import { SegmentedControl } from '@embed-engine/ui';

export function MediaModeToggle() {
  const { mediaMode, setMediaMode } = useWalkthrough();

  return (
    <SegmentedControl
      theme="navy"
      value={mediaMode}
      onChange={setMediaMode}
      options={[
        { value: 'video', label: 'VIDEO' },
        { value: 'photo', label: 'FOTKY' },
      ]}
    />
  );
}
