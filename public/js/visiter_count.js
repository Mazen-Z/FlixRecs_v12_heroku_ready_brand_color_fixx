// Route to increment visit count and return the updated count
app.get('/api/increment-visit', async (req, res) => {
    try {
        // Find the visit count entry in the database (assuming one document in the collection)
        let visitRecord = await VisitCount.findOne();
  
        if (!visitRecord) {
            // If no record exists, create a new one
            visitRecord = new VisitCount({ count: 1 });
            await visitRecord.save();
        } else {
            // Increment the count
            visitRecord.count += 1;
            await visitRecord.save();
        }
  
        // Return the updated visit count
        res.json({ visitCount: visitRecord.count });
    } catch (error) {
        console.error('Error incrementing visit count:', error);
        res.status(500).json({ error: 'Failed to increment visit count' });
    }
  });