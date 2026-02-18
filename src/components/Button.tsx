import {Button, ButtonProps} from "antd";

type ButtonCustomProps = {
  title: string;
  color: 'lilac' | 'grass';
  size?: 'small' | 'middle' | 'large';
} & Pick<ButtonProps, 'onClick'>;

export default function AppButton(props: ButtonCustomProps) {
  const colors: Record<string, 'purple' | 'green'> = {
    lilac: 'purple',
    grass: 'green',
  }

  return (
    <Button variant={'filled'} color={colors[props.color]} size={props.size ?? 'middle'} className="button" onClick={props.onClick}>
        {props.title}
    </Button>
  );
}