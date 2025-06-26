import React from "react";

const Title = ({ text1, text2, title, subTitle, align, font }) => {
  return (
    <>
      <h1 className="font-medium text-2xl">
        {text1}<span className="underline text-primary">
          {text2}
        </span>
      </h1>
      <div
        className={`flex flex-col justify-center items-center text-center ${
          align === "left" && "md:items-start md:text-left"
        }`}
      >
        <h1 className={` text-4xl md:text-[40px] ${font || "font-playfair"}`}>
          {title}
        </h1>
        <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
          {subTitle}
        </p>
      </div>
    </>
  );
};

export default Title;
