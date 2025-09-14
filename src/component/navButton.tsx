import React from "react";

interface Props {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
}

const NavButton = ({ text, bgColor, textColor, onClick }: Props) => {
  return (
    <button style={{ backgroundColor: bgColor, color: textColor}} className="rounded-[10px] p-3 hover:cursor-pointer" onClick={onClick}>
      {text}
    </button>
  );
};

export default NavButton;
