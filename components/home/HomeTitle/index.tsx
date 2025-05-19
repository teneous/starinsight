export function GlowingTitle() {
  return (
    <div className="space-y-4">
      <div className="relative">
        {/* 光锥效果 */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-primary/20 to-transparent blur-3xl opacity-60" />
        <div className="relative">
          <h1 className="text-4xl md:text-5xl lg:text-7xl tracking-tight">
            <span className="relative inline-block font-semibold">
              <span className="absolute inset-0 bg-gradient-to-r from-primary/40 to-primary/10 blur-2xl" />
              <span className="relative bg-gradient-to-br from-white via-white to-primary bg-clip-text text-transparent">
                StarInsight
              </span>
              <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/50 via-primary/70 to-primary/50" />
            </span>
          </h1>
        </div>
      </div>
      <p className="text-lg md:text-xl text-muted-foreground/80 font-light tracking-wide">
        让 AI 重新定义你的技术收藏体验
      </p>
    </div>
  );
}
