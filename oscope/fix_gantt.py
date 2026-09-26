import os

frontend_dir = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP\oscope\frontend"
gantt_file = os.path.join(frontend_dir, "src/features/simulator/GanttChart.tsx")

with open(gantt_file, "r") as f:
    gantt_content = f.read()

# Fix the syntax error on line 40
gantt_content = gantt_content.replace(
    'title={`${ev.process_id}{ev.queue_id ? ` (Q${ev.queue_id})` : \'\'}: ${ev.start_time} - ${ev.end_time}`}',
    'title={`${ev.process_id}${ev.queue_id ? ` (Q${ev.queue_id})` : \'\'}: ${ev.start_time} - ${ev.end_time}`}'
)

with open(gantt_file, "w") as f:
    f.write(gantt_content)
