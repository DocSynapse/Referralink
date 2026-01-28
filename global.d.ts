import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { slot?: string };
      'md-filled-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-filled-tonal-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-outlined-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-elevated-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-filled-tonal-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-outlined-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-text-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-outlined-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; 'suffix-text'?: string; 'error-text'?: string; error?: boolean };
      'md-filled-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; 'error-text'?: string; error?: boolean };
      'md-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { checked?: boolean; indeterminate?: boolean };
      'md-switch': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { selected?: boolean };
      'md-radio': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { name?: string; checked?: boolean };
      'md-slider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { min?: string; max?: string; value?: string; labeled?: boolean; range?: boolean; 'value-start'?: string; 'value-end'?: string; ticks?: boolean; step?: string };
      'md-chip-set': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-filter-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; selected?: boolean };
      'md-input-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string };
      'md-assist-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string };
      'md-suggestion-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string };
      'md-elevation': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-linear-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { indeterminate?: boolean };
      'md-circular-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { indeterminate?: boolean; value?: string; 'four-color'?: boolean };
    }
  }
}