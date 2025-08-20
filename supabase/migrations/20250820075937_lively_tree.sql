/*
  # Clear all confessions and votes

  This migration removes all existing confessions and their associated votes
  to start fresh with the voting system.

  1. Delete Operations
    - Remove all confession votes
    - Remove all confessions
  
  2. Reset any sequences if needed
*/

-- Delete all confession votes first (due to foreign key constraint)
DELETE FROM confession_votes;

-- Delete all confessions
DELETE FROM confessions;