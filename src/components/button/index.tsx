import "./button.css";

interface ButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  variant?: "default" | "outline";
  title?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const CustomButton = ({
  onClick,
  style,
  variant = "default",
  className,
  children,
  disabled = false,
}: ButtonProps) => {
  // Always include base `btn` class so consumers can rely on a shared base.
  const classes = ["btn"];
  if (className) classes.push(className);
  if (variant === "outline") classes.push("btn-outline");
  else classes.push("btn-default");
  if (disabled) classes.push("btn-disabled");
  return (
    <button
      onClick={onClick}
      style={style}
      className={classes.filter(Boolean).join(" ")}
      disabled={disabled}
    >
      {children ? children : "Button"}
    </button>
  );
};

export default CustomButton;
