import "./button.css";

interface ButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  variant?: "default" | "outline";
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

const CustomButton = ({
  onClick,
  style,
  variant = "default",
  className,
  children,
}: ButtonProps) => {
  const classes = [className];
  if (variant === "outline") classes.push("btn-outline");
  else classes.push("btn-default");
  return (
    <button
      onClick={onClick}
      style={style}
      className={classes.filter(Boolean).join(" ")}
    >
      {children ? children : "Button"}
    </button>
  );
};

export default CustomButton;
