import "./button.css";

interface ButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  variant?: "default" | "outline";
  title?: string;
  className?: string;
}

const CustomButton = ({
  onClick,
  style,
  variant = "default",
  className,
  title,
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
      {title ? title : "Button"}
    </button>
  );
};

export default CustomButton;
