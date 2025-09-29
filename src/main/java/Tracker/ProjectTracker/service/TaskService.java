package Tracker.ProjectTracker.service;
import Tracker.ProjectTracker.entity.Task;
import java.util.List;
public interface TaskService {
    Task create(Task task);
    List<Task> list(String assignee, Task.Status status);
    Task get(Long id);
    Task update(Long id, Task task);
    Task updateStatus(Long id, Task.Status status);
    void delete(Long id);
}
