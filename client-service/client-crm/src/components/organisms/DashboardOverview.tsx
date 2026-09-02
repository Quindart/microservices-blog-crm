import { BookOpen, Package, ShoppingCart } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartData } from '../../data/mockData';
export function DashboardOverview() {
  return (
    <>
      <div className="stats">
        <article>
          <span>
            Total revenue <span className="trend">↗ 12.8%</span>
          </span>
          <strong>$84,290</strong>
          <small>vs $74,760 last month</small>
        </article>
        <article>
          <span>
            Active customers <span className="trend">↗ 8.4%</span>
          </span>
          <strong>2,481</strong>
          <small>+194 this month</small>
        </article>
        <article>
          <span>
            Conversion rate <span className="trend">↗ 2.1%</span>
          </span>
          <strong>6.84%</strong>
          <small>Across all channels</small>
        </article>
        <article className="dark-stat">
          <span>Open orders</span>
          <strong>184</strong>
          <small>
            12 need your attention <b>→</b>
          </small>
        </article>
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue overview</h2>
              <p>Daily sales performance</p>
            </div>
            <select>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={26}>
                <CartesianGrid vertical={false} stroke="#e8e9e4" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8b9188', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8b9188', fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: '#f3f4ef' }} />
                <Bar dataKey="sales" fill="#d5e957" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel activity">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Common tasks, ready when you are</p>
            </div>
          </div>
          {[
            ['Add a new product', Package],
            ['Review open orders', ShoppingCart],
            ['Write a blog post', BookOpen],
          ].map(([label, Icon]) => (
            <button className="quick-action" key={String(label)}>
              <span>{typeof Icon === 'function' && <Icon size={17} />}</span>
              {String(label)}
              <b>→</b>
            </button>
          ))}
        </section>
      </div>
    </>
  );
}
