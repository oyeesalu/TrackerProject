package Tracker.ProjectTracker.repository;
import Tracker.ProjectTracker.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface TaskRepository extends JpaRepository<Task, Long> {



    List<Task> findByAssignee(String assignee);

    List<Task> findByStatus(Task.Status status);
}
