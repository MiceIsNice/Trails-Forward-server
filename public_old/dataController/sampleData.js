
function sampleContracts(){
	return [
			{role: "logger",
			 name: "Produce Pulp",
			 company: "We Make Paper",
			 political: "0",
			 money: "30000",
			 months_to_complete: "3",
			 description: "cut trees for 1000 cf of pulp",
			 included_land: "none",
			 wood_type: "any",
			 volume: "1000",
			 acceptance_message: "We're happy you chose us! Now get to work!"
			 },
			{role: "logger",
			 name: "Clear land for a developemnt",
			 company: "Houses For Everyone (who can afford them)",
			 political: "0",
			 money: "15000",
			 months_to_complete: "2",
			 description: "clear land however you like for the developer",
			 included_land: "9 tiles",
			 wood_type: "any",
			 volume: "none",
			 acceptance_message: "We're happy you chose us! Now get to work!"
			 },
			{role: "logger",
			 name: "Clear land for a park",
			 company: "Conservationists For America",
			 political: "5",
			 money: "12000",
			 months_to_complete: "2",
			 description: "Clear all trees smaller than 18 inches in diameter to make room for a park",
			 included_land: "6 tiles",
			 wood_type: "any",
			 volume: "none",
			 acceptance_message: "We're happy you chose us! Now get to work!"
			 }
			];
}


function sampleUpgrades(){
	return [
			{role: "logger",
			 name: "truck",
			 cost_initial: "20000",
			 cost_operating: "50",
			 const_maintenance: "5000",
			 condition: "good",
			 reliability: "good",
			 benefits: "transport up to 100 logs per day to the mill"
			 },
			{role: "logger",
			 name: "feller-buncher",
			 cost_initial: "80000",
			 cost_operating: "200",
			 const_maintenance: "10000",
			 condition: "good",
			 reliability: "fair",
			 benefits: "cut and prep 30 logs per day"
			 },
			{role: "logger",
			 name: "forwarder",
			 cost_initial: "40000",
			 cost_operating: "100",
			 const_maintenance: "8000",
			 condition: "good",
			 reliability: "great",
			 benefits: "Move up to 100 logs per day from stump to landing for transport."
			 },
			];
}

console.log(sampleContracts());
console.log(sampleUpgrades());
