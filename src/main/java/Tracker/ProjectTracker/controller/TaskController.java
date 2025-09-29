package Tracker.ProjectTracker.controller;

import Tracker.ProjectTracker.entity.Task;
import Tracker.ProjectTracker.service.TaskService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    // 1) Create task
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Task> create( @RequestBody Task task) {
        Task saved = service.create(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 2) List tasks (optional filters)
    @GetMapping
    public ResponseEntity<List<Task>> list(
            @RequestParam(required = false) String assignee,
            @RequestParam(required = false) Task.Status status) {
        return ResponseEntity.ok(service.list(assignee, status));
    }

    // 3) Get one
    @GetMapping("/{id}")
    public ResponseEntity<Task> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    // 4) Full update
    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable Long id, @Valid @RequestBody Task task) {
        return ResponseEntity.ok(service.update(id, task));
    }

    // 5) Update status only
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestParam Task.Status status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    // 6) Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}