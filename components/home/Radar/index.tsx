import './styles.css';

export function Radar() {
  return (
    <div className="hidden lg:block relative">
      <div className="absolute -inset-4">
        <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/20 blur-3xl" />
      </div>
      <div className="relative aspect-square">
        {/* 雷达背景 */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/20"
              style={{
                transform: `scale(${1 - i * 0.2})`,
                animation: `radar-scale 4s ${i * 0.5}s infinite`,
              }}
            />
          ))}
        </div>

        {/* 扫描线 */}
        <div className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite]">
          <div className="h-1/2 w-[2px] mx-auto bg-gradient-to-b from-primary/80 to-transparent blur-[2px]" />
        </div>

        {/* 动态点状装饰 */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => {
            const radius = 20 + Math.random() * 30;
            const angle = (i * 30 + Math.random() * 15) * (Math.PI / 180);
            return (
              <span
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  top: `${50 + radius * Math.sin(angle)}%`,
                  left: `${50 + radius * Math.cos(angle)}%`,
                  backgroundColor: `rgba(${Math.random() > 0.5 ? '255,255,255' : '120,119,198'},${0.2 + Math.random() * 0.3})`,
                  animation: `pulse ${1 + Math.random() * 2}s ${Math.random() * 2}s infinite`,
                  boxShadow: '0 0 8px rgba(120,119,198,0.3)',
                }}
              />
            );
          })}
        </div>

        {/* 光点轨迹 */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `trace-path ${6 + i * 2}s ${i * 2}s infinite`,
                boxShadow: '0 0 12px rgba(120,119,198,0.5)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
