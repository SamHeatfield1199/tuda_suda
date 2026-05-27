import { Button, ButtonProps } from 'antd';

type ButtonCustomProps = {
  title: string;
  color: 'lilac' | 'grass' | 'red';
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
} & Pick<ButtonProps, 'onClick'>;

// Компонент для отображения кнопки с кастомными стилями
export default function AppButton(props: ButtonCustomProps) {
  const colors: Record<string, 'purple' | 'green' | 'red'> = {
    lilac: 'purple',
    grass: 'green',
    red: 'red',
  };

  return (
    <Button
      variant={'filled'}
      color={colors[props.color]}
      size={props.size ?? 'middle'}
      className='button'
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.title}
    </Button>
  );
}
