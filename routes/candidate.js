const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const User = require('../models/user');
const Candidate = require('../models/candidate')


const checkAdminRole = async (userId) =>{
    try {
        const user = await User.findById(userId);
        if(user.role === "admin"){
            return true;
        }
        } catch (error) {
        return false;
    }
}

router.post('/',jwtAuthMiddleware,async (req, res) =>{
   try{
        if(! await checkAdminRole(req.user.id))
            return res.status(403).json({message: 'User has not admin role'})
            
            // if the user has not admin role it does not run the next code
            const data = req.body;
            const newCandidate = new Candidate(data);
            const response = await newCandidate.save();   //await is wait until the async operation is completed

            console.log('Candidate saved');

            res.status(200).json({response: response})
        
    }
   catch(err){
    console.log(err);
    res.status(500).json({error: 'internal server error'});
   }
})

router.put('/:candidateId',jwtAuthMiddleware, async(req, res) => {
    try {
        if(! await checkAdminRole(req.user.id))
            return res.status(403).json({message: 'User has not admin role'})

            const candidateId = req.params.candidateId;
            // console.log("candidate id :"+candidateId);
            const updatedCandidateData = req.body;

            const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
                    new: true,
                    runValidators: true
                })

                if(!response){
                    return res.status(404).json({error: "Candidate not found"})
                }

            console.log("Candidate data updated");
            res.status(200).json(response)
    
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "internal server error"})
    }
})

router.delete('/:candidateId',jwtAuthMiddleware, async(req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)){
         return res.status(403).json({message: 'User has not admin role'})}

            const candidateId = req.params.candidateId;

            const response = await Candidate.findByIdAndDelete(candidateId)

                if(!response){
                    return res.status(404).json({error: "Candidate not found"})
                }

            console.log("Candidate data deleted");
            res.status(200).json(response)
    
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "internal server error"})
    }
})


//lets start voting

router.post('/vote/:candidateId', jwtAuthMiddleware,async (req, res) => {
    //not admin can vote
    // user can vote only once

    candidateId = req.params.candidateId;
    userId = req.user.id;

    try {
        //find the candidate document with the specified candidateId
        const candidate = await Candidate.findById(candidateId)
        if(!candidate){
            return res.status(404).json({message: "Candidate not found"})
        }
        //find the user with the specified userId
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: "user not found"})
        }

        if(user.isVoted){
            return res.status(404).json({message: "user is already voted"})
        }
        if(user.role == "admin"){
            return res.status(404).json({message: "Admin is not allowed to vote"})
        }

        // update the candidate document to record the vote
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        //update the user document 
        user.isVoted = true;
        await user.save()

        res.status(200).json({message: "Vote recored successfully"}); 

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "internal server error"})
    }

})

router.get('/vote/count', async (req, res) => {
    try {
        // find all candidates and sort them by descending vote count
        const candidates = await Candidate.find().sort({ voteCount: 'desc' });

        // map the candidates to only return their name and vote count
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        res.status(200).json({ voteRecord });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal server error" });
    }
})


//get the list of candidates
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party id age');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;