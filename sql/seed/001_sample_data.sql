-- Insert sample players
INSERT INTO players (name, speed, throwing, awareness, catching, defense, endurance, spirit) VALUES
('Alex Smith', 85, 92, 88, 90, 87, 83, 4),
('Jordan Lee', 78, 75, 82, 79, 81, 85, 3),
('Sam Wilson', 65, 70, 68, 72, 69, 75, 3),
('Taylor Chen', 45, 52, 48, 50, 47, 55, 2),
('Morgan Brown', 30, 35, 32, 38, 33, 40, 2),
('Chris Davis', 15, 18, 20, 17, 16, 22, 1),
('Pat Johnson', 92, 88, 90, 87, 89, 85, 4),
('Jamie Garcia', 73, 77, 75, 78, 72, 80, 3),
('Robin Zhang', 58, 62, 57, 63, 59, 65, 2),
('Casey White', 25, 28, 27, 30, 26, 35, 1);

-- Insert sample contests
INSERT INTO contests (player_id, proposed_stats, contest_notes, contest_status) 
SELECT 
    id as player_id,
    jsonb_build_object(
        'speed', speed + 5,
        'throwing', throwing + 3,
        'awareness', awareness + 4,
        'catching', catching + 2,
        'defense', defense + 3,
        'endurance', endurance + 4,
        'spirit', LEAST(spirit + 1, 4)
    ) as proposed_stats,
    'Regular season performance improvement' as contest_notes,
    'pending' as contest_status
FROM players
WHERE name IN ('Alex Smith', 'Jordan Lee', 'Sam Wilson')
LIMIT 3; 