import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

type MaskFunction = (value: string) => string;

interface MaskedInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  mask: MaskFunction;
  onChange: (value: string) => void;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = mask(e.target.value);
      onChange(maskedValue);
    };

    return <Input ref={ref} {...props} onChange={handleChange} />;
  }
);

MaskedInput.displayName = 'MaskedInput';
