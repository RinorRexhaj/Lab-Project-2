interface TypingProps {
  scrollDown: boolean;
  scrollToBottom: (smooth: boolean) => void;
}

const Typing: React.FC<TypingProps> = ({ scrollDown, scrollToBottom }) => {
  if (!scrollDown) scrollToBottom(false);

  return (
    <div
      className={`relative min-h-8 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 text-base max-w-[70%] w-fit bg-gray-200 mb-2 animate-fadeIn [animation-fill-mode:backwards]`}
    >
      {" "}
      <div className="w-2 h-2 rounded-full bg-gray-800 animate-typing [animation-delay:-1s]"></div>
      <div className="w-2 h-2 rounded-full bg-gray-800 animate-typing [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 rounded-full bg-gray-800 animate-typing [animation-delay:0.4s]"></div>
      <div
        className={`absolute w-0 h-0 border-t-8 border-l-transparent border-r-transparent border-r-8 border-bl-8 border-t-gray-200 -bottom-2 left-2`}
      ></div>
    </div>
  );
};

export default Typing;
