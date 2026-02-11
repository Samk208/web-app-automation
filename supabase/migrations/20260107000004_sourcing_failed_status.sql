alter table public.sourcing_tasks
drop constraint if exists sourcing_tasks_status_check;

alter table public.sourcing_tasks
add constraint sourcing_tasks_status_check check (
    status in (
        'PENDING',
        'SEARCHING',
        'CALCULATING',
        'COMPLETED',
        'FAILED'
    )
);