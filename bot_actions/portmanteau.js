const hasVowel = (inString) => {
    const vowels = ['a','e','i','o','u']
	letters = list(inString)
	return '';
};
	
const letterTrios = (inString) => {
	let trios = []
    let letters = inString.split('');
    for (let i = 0; i < letters.length; i += 1) {
        const letterPos = i;
        const letter = letters[letterPos];
        if (letterPos === letters.length - 2) {
            break;
        }
        const nextLetter = letters[letterPos + 1];
        const nextNextLetter = letters[letterPos + 2];
        const trio = `${letter}${nextLetter}${nextNextLetter}`;
        trios.push(trio);
    }
    return trios;
};


const makepmByTrios = (stringA, stringB) => {
	// find all shared trios and their positions in each string
	aTrios = letterTrios(stringA)
	bTrios = letterTrios(stringB)
	if (aTrios.length < 3 || bTrios.length < 3) {
        return 'FAIL: word too short for trios';
    }
	aTrios = aTrios[1:]
	bTrios = bTrios[:-2]

	// look for shared trios
	const hasSharedTrios = false
	posOfTrios = []
	for aPos, aTrio in enumerate(aTrios):
		if hasSharedTrios:
			break
		for bPos, bTrio in enumerate(bTrios):
			if hasSharedTrios:
				break
			if aTrio == bTrio:
				hasSharedTrios = True
				#print "Found shared trio, '"+aTrio+"' at ("+str(aPos)+","+str(bPos)+")"
				posOfTrios.append(aPos+1)
				posOfTrios.append(bPos)

	// check if both strings have shared trios
	if not hasSharedTrios:
		return "FAIL: don't have shared trios"
	
	// put together and return portmanteau
	outA = stringA[:posOfTrios[0]] // everything up to and EXcluding the chosen trio in string A
	outB = stringB[posOfTrios[1]:] // everything after and INcluding the chosen trio in string B
	return outA+outB
};


const makepm = (stringA, stringB) => {
	
	// try to make pm by pairs first
	triopm = makepmByTrios(stringA, stringB)
	if "FAIL" not in triopm:
		return triopm

	// check if both strings have at least 1 vowel
	if not hasVowel(stringA) or not hasVowel(stringB):
		return "FAIL: don't have vowels in both strings"
	
	// find all vowels and their positions in each string
	vowels = ['a','e','i','o','u']
	aVowels = []
	bVowels = []
	for aLetter in stringA:
		if aLetter in vowels:
			aVowels.append(aLetter)
		else:
			aVowels.append("")
	for bLetter in stringB:
		if bLetter in vowels:
			bVowels.append(bLetter)
		else:
			bVowels.append("")

	// see if A and B have any vowels in common
	haveCommonVowels = False
	shouldUseCommonVowels = False
	vowelPairPositions = []
	for aVowelPos, aVowel in enumerate(aVowels):
		for bVowelPos, bVowel in enumerate(bVowels):
			if aVowel == bVowel and aVowel != "":
				vowelPairPositions.append([aVowelPos,bVowelPos])
				haveCommonVowels = True

	// place to record positions of vowels we decide to use
	posOfVowelsToUse = [-1,-1]
	
	// if we have common vowels, choose whether to use them based on position
	if haveCommonVowels:
		margin = 2 # guarantees output satisfies len(pm) > 2*margin
		for vowelPairPosition in vowelPairPositions:
			if vowelPairPosition[0] < margin or vowelPairPosition[1] >= len(stringB)-margin:
				continue
			else:
				posOfVowelsToUse = vowelPairPosition
				shouldUseCommonVowels = True
				break

	// if not using common vowels, just pick any vowels based on position
	if not shouldUseCommonVowels:
		aVowelPos = -1
		bVowelPos = len(stringB)+1
		for aVowelIndex, aVowel in enumerate(aVowels):
			if aVowel != "" and aVowelIndex > aVowelPos:
				aVowelPos = aVowelIndex
		for bVowelIndex, bVowel in enumerate(bVowels):
			if bVowel != "" and bVowelIndex < bVowelPos:
				bVowelPos = bVowelIndex
		posOfVowelsToUse[0] = aVowelPos
		posOfVowelsToUse[1] = bVowelPos
	
	// put together and return portmanteau
	outA = stringA[:posOfVowelsToUse[0]] // everything up to and EXcluding the chosen vowel in string A
	outB = stringB[posOfVowelsToUse[1]:] // everything after and INcluding the chosen vowel in string B
	return outA+outB
};


// check inputs
// inputs = sys.argv

// if len(inputs) != 3:
// 	print "Need to provide 2 arguments"
// 	exit()

// outputPM = makepm(inputs[1],inputs[2])
// print "Output portmanteau is '"+outputPM+"'"