package com.bee.exp.web;

import com.bee.exp.service.LeaderboardService;
import com.bee.exp.web.dto.LeaderEntryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leader")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public List<LeaderEntryResponse> getLeaderboard() {
        return leaderboardService.getTop10Leaders();
    }
}
