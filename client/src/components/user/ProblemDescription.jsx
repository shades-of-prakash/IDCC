const ProblemDescription = ({ problem, sno }) => {
  return (
    <div className="relative h-full w-full border border-neutral-300  rounded-lg overflow-y-auto bg-white  ">
      <div
        className="flex items-center justify-between sticky top-0 z-10 px-3 py-2
                   bg-white/80 backdrop-blur-lg border-b border-neutral-200 bg-white  "
      >
        <div className="text-xl font-bold">
          {sno + 1}. {problem.name}
        </div>
        <span className="text-sm">{problem.points} pts</span>
      </div>

      <div
        className="p-4 prose prose-neutral max-w-none
                   [&_p]:mb-3
                   [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6
                   [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6
                   [&_li]:my-1
                   [&_pre]:whitespace-pre-wrap
                   [&_*]:break-words
                   [&_img]:w-[420px] [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-10
                   bg-white  "
        dangerouslySetInnerHTML={{ __html: problem.statement }}
      ></div>
    </div>
  );
};

export default ProblemDescription;
