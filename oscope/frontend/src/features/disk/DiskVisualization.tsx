import { useDiskStore } from '../../store/useDiskStore';
import { VisualCanvas, VisualizationLegendItem } from '../visualization/VisualCanvas';
export function DiskVisualization() {
  const { result, currentStep, algorithm, diskSize } = useDiskStore();

  if (!result || result.movement_steps.length === 0) return null;

  const stepsToRender = result.movement_steps.slice(0, currentStep);

  const legend = (
    <>
      <VisualizationLegendItem color="bg-slate-300" label="CYLINDER TRACK" />
      <VisualizationLegendItem color="bg-blue-600" label="CURRENT HEAD" />
      <VisualizationLegendItem color="bg-emerald-500" label="SERVICED REQUEST" />
      <VisualizationLegendItem color="bg-slate-800" label="MOVEMENT PATH" />
    </>
  );

  const statusStr = currentStep >= result.movement_steps.length ? 'COMPLETED' : 'SEEKING';

  // SVG parameters
  const width = 800;
  const height = 400;
  const marginX = 40;
  const marginY = 40;
  
  const innerWidth = width - marginX * 2;
  const innerHeight = height - marginY * 2;
  
  const maxCylinder = Math.max(
    diskSize || 199,
    ...result.movement_steps.map(s => Math.max(s.start_cylinder, s.end_cylinder))
  );

  const getX = (cylinder: number) => marginX + (cylinder / maxCylinder) * innerWidth;
  const getY = (stepIndex: number) => marginY + (stepIndex / Math.max(1, result.movement_steps.length)) * innerHeight;

  const pathD = stepsToRender.map((step, idx) => {
    const x = getX(step.end_cylinder);
    const y = getY(idx + 1);
    if (idx === 0) {
      const startX = getX(step.start_cylinder);
      const startY = getY(0);
      return `M ${startX} ${startY} L ${x} ${y}`;
    }
    return `L ${x} ${y}`;
  }).join(' ');

  return (
    <div className="h-[500px]">
      <VisualCanvas 
        title="Disk Head Scheduling Map" 
        subtitle={`${algorithm} • Step ${currentStep} of ${result.movement_steps.length} • Total Seek: ${result.total_head_movement} • ${statusStr}`}
        legend={legend}
      >
        <div className="flex justify-center items-center w-full h-full overflow-visible">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-w-full drop-shadow-sm overflow-visible">
            {/* Grid Lines (Cylinders) */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const x = marginX + pct * innerWidth;
              const cyl = Math.round(pct * maxCylinder);
              return (
                <g key={`grid-${pct}`}>
                  <line x1={x} y1={marginY} x2={x} y2={height - marginY + 20} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1" />
                  <text x={x} y={height - marginY + 35} fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="bold">
                    {cyl}
                  </text>
                </g>
              );
            })}
            
            {/* Start point */}
            {stepsToRender.length > 0 && (
              <circle 
                cx={getX(stepsToRender[0].start_cylinder)} 
                cy={getY(0)} 
                r="5" 
                fill="#94a3b8" 
              />
            )}

            {/* Movement Path */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="#0f172a" 
              strokeWidth="2.5" 
              strokeLinejoin="round" 
              className="transition-all duration-300"
            />
            
            {/* Nodes */}
            {stepsToRender.map((step, idx) => {
              const cx = getX(step.end_cylinder);
              const cy = getY(idx + 1);
              const isLast = idx === stepsToRender.length - 1;
              return (
                <g key={`node-${idx}`} className="group cursor-pointer transition-transform duration-300 hover:scale-110">
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isLast ? "8" : "6"} 
                    fill={isLast ? "#2563eb" : "#10b981"} 
                    stroke="white" 
                    strokeWidth="2" 
                    className="drop-shadow"
                  />
                  
                  {/* Tooltip text (SVG native fallback) */}
                  <text x={cx} y={cy - 12} fontSize="10" fill="#1e293b" textAnchor="middle" fontWeight="bold" opacity="0" className="group-hover:opacity-100 transition-opacity drop-shadow-md bg-white">
                    {step.end_cylinder} (Δ{step.movement})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </VisualCanvas>
    </div>
  );
}
