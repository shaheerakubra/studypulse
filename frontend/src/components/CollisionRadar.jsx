export function CollisionRadar({ collisions }) {
  if (!collisions?.days?.length) return null;
  return (
    <div>
      <div className="radar">
        {collisions.days.map((day) => (
          <div key={day.date} className={`radar-day ${day.intensity}`} title={day.label}>
            <div className="date">{day.label}</div>
            <div className="hours">{day.hours}h</div>
            <div className="meta">
              {day.taskCount} due · {day.intensity}
            </div>
          </div>
        ))}
      </div>
      <p className="meta" style={{ marginTop: 12 }}>
        {collisions.narrative}
      </p>
    </div>
  );
}
