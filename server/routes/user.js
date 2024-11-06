// GET leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await User.aggregate([
            { $lookup: { from: 'games', localField: '_id', foreignField: 'winner', as: 'gamesWon' } },
            { $addFields: { gamesWonCount: { $size: '$gamesWon' } } },
            { $sort: { gamesWonCount: -1 } },
            { $limit: 10 },
            { $project: { username: 1, gamesWonCount: 1 } }
        ]);
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving leaderboard.' });
    }
});
