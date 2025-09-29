package Tracker.ProjectTracker.service;
import Tracker.ProjectTracker.entity.Task;
import Tracker.ProjectTracker.repository.TaskRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository repo;

    public TaskServiceImpl(TaskRepository repo) { this.repo = repo; }

    public Task create(Task task) { task.setId(null); return repo.save(task); }

    @Transactional(readOnly = true)
    public List<Task> list(String assignee, Task.Status status) {
        if (assignee != null && !assignee.isBlank()) return repo.findByAssignee(assignee);
        if (status != null) return repo.findByStatus(status);
        return repo.findAll();
    }

    public Task get(Long id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
    }

    public Task update(Long id, Task input) {
        Task t = get(id);
        t.setTitle(input.getTitle());
        t.setDescription(input.getDescription());
        t.setAssignee(input.getAssignee());
        t.setDueDate(input.getDueDate());
        t.setStatus(input.getStatus());
        return repo.save(t);
    }

    public Task updateStatus(Long id, Task.Status status) {
        Task t = get(id);
        t.setStatus(status);
        return repo.save(t);
    }

    public void delete(Long id) { repo.deleteById(id); }
}

