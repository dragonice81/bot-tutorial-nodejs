import { logger } from "logger";
import { GroupMeMessage } from "models";

const _ = require('lodash');
const sendMessage = require('./send_message');

const badInputs = [
  'thank',
  'hahaha',
  'thanks',
  'where',
  'thanks',
  'garrettbot',
  'for',
  'one',
  'only',
  'haha',
  'lol',
  'yes',
  'please',
  'really',
  'nope',
  'nerr',
  'you',
  'her',
  'she'
];

const hasVowel = (inString) => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const letters = inString.split('');
  const intersect = _.intersection(vowels, letters);
  return intersect.length !== 0;
};

const letterTrios = (inString) => {
  const trios = [];
  const letters = inString.split('');
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
  let aTrios = letterTrios(stringA);
  let bTrios = letterTrios(stringB);
  if (aTrios.length < 3 || bTrios.length < 3) {
    return 'FAIL: word too short for trios';
  }
  aTrios = aTrios.slice(1);
  bTrios = bTrios.slice(0, bTrios.length - 2);

  // look for shared trios
  let hasSharedTrios = false;
  const posOfTrios = [];
  for (let i = 0; i < aTrios.length; i += 1) {
    const aPos = i;
    const aTrio = aTrios[i];
    if (hasSharedTrios) {
      break;
    }
    for (let j = 0; j < bTrios.length; j += 1) {
      const bPos = j;
      const bTrio = bTrios[j];
      if (hasSharedTrios) {
        break;
      }
      if (aTrio === bTrio) {
        hasSharedTrios = true;
        posOfTrios.push(aPos + 1);
        posOfTrios.push(bPos);
      }
    }
  }
  if (!hasSharedTrios) {
    return 'FAIL: no shared trios';
  }

  // put together and return portmanteau
  const outA = stringA.slice(posOfTrios[0]); // everything up to and EXcluding the chosen trio in string A
  const outB = stringB.slice(posOfTrios[1], stringB.length); // everything after and INcluding the chosen trio in string B
  return `${outA}${outB}`;
};


export const makepm = async (message: GroupMeMessage) => {
  const {text} = message;
  if (!text || text.split(' ').length !== 2) {
    logger.info('Input didn\'t match requirements');
    Promise.resolve();
  }
  const stringA = text.split(' ')[0];
  const stringB = text.split(' ')[1];
  if ((stringA.length < 3 || stringB.length < 3) || (badInputs.includes(stringA.toLowerCase()) || badInputs.includes(stringB.toLowerCase()))) {
    logger.info('Input didn\'t match requirements');
    Promise.resolve();
  }
  if (_.random(100) >= 25) {
    logger.info('Random number wasn\'t right for portmanteau');
    Promise.resolve();
  }
  if (stringA.toLowerCase() === 'cedar' && stringB.toLowerCase() === 'rapids') {
    await sendMessage({response: `${stringA} + ${stringB} = crapids`, group_id: message.group_id});
  }
  // try to make pm by pairs first
  const triopm = makepmByTrios(stringA, stringB);

  if (!triopm.includes('FAIL')) {
    await sendMessage({response: `${stringA} + ${stringB} = ${triopm}`, group_id: message.group_id});
  }

  // check if both strings have at least 1 vowel
  if (!hasVowel(stringA) || !hasVowel(stringB)) {
    logger.info("FAIL: don't have vowels in both strings");
    Promise.resolve();
  }
  // find all vowels and their positions in each string
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const aVowels = [];
  const bVowels = [];
  const aLetters = stringA.split('');
  const bLetters = stringB.split('');
  aLetters.forEach((aLetter) => {
    if (vowels.includes(aLetter)) {
      aVowels.push(aLetter);
    } else {
      aVowels.push('');
    }
  });
  bLetters.forEach((bLetter) => {
    if (vowels.includes(bLetter)) {
      bVowels.push(bLetter);
    } else {
      bVowels.push('');
    }
  });

  // see if A and B have any vowels in common
  let haveCommonVowels = false;
  const vowelPairPositions = [];
  for (let i = 0; i < aVowels.length; i += 1) {
    const aVowelPos = i;
    const aVowel = aVowels[aVowelPos];
    for (let j = 0; j < bVowels.length; j += 1) {
      const bVowelPos = j;
      const bVowel = bVowels[bVowelPos];
      if ((aVowel && bVowel) && aVowel === bVowel) {
        vowelPairPositions.push([aVowelPos, bVowelPos]);
        haveCommonVowels = true;
      }
    }
  }
  let shouldUseCommonVowels = false;
  // place to record positions of vowels we decide to use
  let posOfVowelsToUse = [-1, -1];
  // if we have common vowels, choose whether to use them based on position
  if (haveCommonVowels) {
    const margin = 2; // guarantees output satisfies len(pm) > 2*margin
    vowelPairPositions.forEach((vowelPairPosition) => {
      if (!(vowelPairPosition[0] < margin || vowelPairPosition[1] >= stringB.length - margin)) {
        posOfVowelsToUse = vowelPairPosition;
        shouldUseCommonVowels = true;
      }
    });
  }
  if (!shouldUseCommonVowels) {
    let aVowelPos = -1;
    let bVowelPos = stringB.length + 1;
    for (let i = 0; i < aVowels.length; i += 1) {
      const aVowelIndex = i;
      const aVowel = aVowels[aVowelIndex];
      if (aVowel && aVowelIndex > aVowelPos) {
        aVowelPos = aVowelIndex;
      }
    }
    for (let i = 0; i < bVowels.length; i += 1) {
      const bVowelIndex = i;
      const bVowel = bVowels[bVowelIndex];
      if (bVowel && bVowelIndex < bVowelPos) {
        bVowelPos = bVowelIndex;
      }
    }
    posOfVowelsToUse[0] = aVowelPos;
    posOfVowelsToUse[1] = bVowelPos;
  }

  const outA = stringA.slice(0, posOfVowelsToUse[0]);
  const outB = stringB.slice(posOfVowelsToUse[1]);
  await sendMessage({response: `${stringA} + ${stringB} = ${outA}${outB}`, group_id: message.group_id});
};
