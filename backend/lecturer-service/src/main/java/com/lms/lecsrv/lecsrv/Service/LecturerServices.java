package com.lms.lecsrv.lecsrv.Service;

import com.lms.lecsrv.lecsrv.Entity.Lecturer;
import com.lms.lecsrv.lecsrv.Repo.LecturerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service class that handles business logic for lecturer operations.
 * This service provides methods for creating, reading, updating, and deleting lecturer data.
 * It acts as an intermediary between the controller layer and the data access layer.
 */
@Service
public class LecturerServices {

    /**
     * Repository for lecturer data access operations.
     * Automatically injected by Spring's dependency injection.
     */
    @Autowired
    private LecturerRepo lecturerRepo;
    
    /**
     * Saves a new lecturer or updates an existing one.
     * If the lecturer has an ID that already exists, it will update that record.
     * Otherwise, it will create a new lecturer record.
     *
     * @param lecturer The lecturer entity to be saved or updated
     */
    public void saveOrAddLecturer(Lecturer lecturer) {
        lecturerRepo.save(lecturer);
    }

    /**
     * Retrieves all lecturers from the database.
     *
     * @return An iterable collection of all lecturer entities
     */
    public Iterable<Lecturer> getAllLecturers() {
        return this.lecturerRepo.findAll();
    }

    /**
     * Deletes a lecturer by their ID.
     *
     * @param id The unique identifier of the lecturer to be deleted
     */
    public void deleteLecturer(String id) {
        this.lecturerRepo.deleteById(id);
    }

    /**
     * Retrieves a specific lecturer by their ID.
     *
     * @param id The unique identifier of the lecturer to retrieve
     * @return The lecturer entity if found, null otherwise
     */
    public Lecturer getLecturer(String id) {
        // Check if lecturer with the given ID exists
        if (this.lecturerRepo.findById(id).isPresent()) {
            // Return the lecturer if present
            return this.lecturerRepo.findById(id).get();
        } else {
            // Return null if lecturer not found
            return null;
        }
    }
}
