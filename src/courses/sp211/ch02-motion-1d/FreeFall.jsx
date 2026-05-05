import { useState, useMemo } from 'react';
import ControlPanel from '@shared/components/ControlPanel';
import Slider from '@shared/components/Slider';
import Readout from '@shared/components/Readout';
import InfoPanel from '@shared/components/InfoPanel';
import IntensityPlot from '@shared/components/IntensityPlot';

const G = 9.81; // m/s^2
const DEFAULTS = { y0: 20, v0: 0 };

export default function FreeFall() {
  const [y0, setY0] = useState(DEFAULTS.y0);
  const [v0, setV0] = useState(DEFAULTS.v0);

  const reset = () => { setY0(DEFAULTS.y0); setV0(DEFAULTS.v0); };

  // Time to hit ground: y0 + v0*t - 0.5*g*t^2 = 0
  const disc = v0 * v0 + 2 * G * y0;
  const tGround = disc > 0 ? (v0 + Math.sqrt(disc)) / G : 0;
  const tMax = tGround * 1.05;

  const nPts = 500;
  const { tData, yData, vData } = useMemo(() => {
    const ts = [], ys = [], vs = [];
    for (let i = 0; i < nPts; i++) {
      const t = (i / (nPts - 1)) * tMax;
      const y = y0 + v0 * t - 0.5 * G * t * t;
      ts.push(t);
      ys.push(Math.max(0, y));
      vs.push(v0 - G * t);
    }
    return { tData: ts, yData: ys, vData: vs };
  }, [y0, v0, tMax]);

  const posTrace = {
    x: tData, y: yData,
    type: 'scatter', mode: 'lines',
    line: { color: '#C5B783', width: 2.5 },
    name: 'y(t)',
  };

  const velTrace = {
    x: tData, y: vData,
    type: 'scatter', mode: 'lines',
    line: { color: '#5B9BD5', width: 2.5 },
    name: 'v(t)',
    yaxis: 'y2',
  };

  const vImpact = v0 - G * tGround;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <ControlPanel onReset={reset}>
        <Slider label="Initial height (y₀)" value={y0} min={1} max={100} step={1} unit="m" onChange={setY0} />
        <Slider label="Initial velocity (v₀)" value={v0} min={-20} max={20} step={0.5} unit="m/s" onChange={setV0} />
        <div className="mt-4 border-t border-usna-grid pt-3">
          <Readout label="Time to ground" value={tGround.toFixed(2)} unit="s" />
          <Readout label="Impact speed" value={Math.abs(vImpact).toFixed(1)} unit="m/s" />
        </div>
      </ControlPanel>

      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-usna-card border border-usna-grid rounded-lg p-4" style={{ height: 420 }}>
          <IntensityPlot
            traces={[posTrace, velTrace]}
            layoutOverrides={{
              showlegend: true,
              legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)' },
              xaxis: { title: { text: 'Time (s)' } },
              yaxis: { title: { text: 'Position y (m)' }, range: undefined },
              yaxis2: {
                title: { text: 'Velocity (m/s)' },
                overlaying: 'y',
                side: 'right',
                tickfont: { size: 13, color: '#5B9BD5' },
                titlefont: { color: '#5B9BD5' },
              },
            }}
          />
        </div>

        <InfoPanel
          title="Free Fall"
          description={`An object released from height y₀ with initial velocity v₀ falls under constant gravitational acceleration g = ${G} m/s². Position and velocity are shown as functions of time. The gold curve is position; the blue curve is velocity.`}
          equation={String.raw`y(t) = y_0 + v_0 t - \tfrac{1}{2}g t^2, \qquad v(t) = v_0 - g t`}
        />
      </div>
    </div>
  );
}
