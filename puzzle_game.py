import random as r
import enum


def drawBoard(board):
    for row in board:
        print('    {0}   |  {1}    |  {2}      '.format(*row))
        print('-'*20)


def randomizeBoard(board):
    b = flatten(board)
    r.shuffle(b)
    cols = len(board[0])
    return [b[i:i+cols] for i in range(0, len(b), cols)]



def getRandomBoard(dim):
    b = list(range(0, dim*dim ))
    r.shuffle(b)
    return [b[i:i+dim] for i in range(0, dim*dim, dim)]
    
    
def cell_exists(board, row, col):
    try:
        item = board[row][col]
    except IndexError:
        item = None
    return item is not None


board = getRandomBoard(3)
drawBoard(board)


class AI:
    # this class produces a solution to the game puzzle
     def __init__(self, b):
         self.initial_board_nueron = Nueron(b)
         self.goal_board_nueron = self.get_goal_nueron()
         self.frontier = StackFrontier()
         self.frontier.add(self.initial_board_nueron)
         
     def search(self):
         # search algorithm
         while True:
             if self.frontier.empty():
                 return
             nueron = self.frontier.pop()
             print(nueron)
             if nueron == self.goal_board_nueron:
                 return Solution( self.initial_board_nueron, nueron).resolve()
             self.frontier.add(*nueron.expand())
     
     def get_goal_nueron(self):
         return Nueron([[1,2,3],[4,5,6],[7,8,0]])


class Nueron:
    # keeping track of which state produces another
    # produces a network hence the nueron is needed
    
    state = []
    parent = None
    birthAction = None
    
    
    # empty cell info
    c_row, c_col = 0,0
    
    def __init__(self, state, parent=None, birthAction=None):
        self.state = state
        print('state', state)
        self.parent = parent
        self.birthAction = birthAction
        
        self.c_row, self.c_col = self.find_empty_cell()
    
    def expand(self):
        for action in self.get_possible_actions():
            print(action)
            yield Nueron(self.make_board(action), parent=self, birthAction=action)
    
    def make_board(self, action):
        newBoardState = self.state.copy()
        c_row, c_col = self.c_row, self.c_col
        if action == Action.SlideUp: # hint: whats below slides up
            newBoardState[c_row][c_col] = self.state[c_row - 1][c_col]
        elif action == Action.SlideDown: # hint: whats above slides down
            newBoardState[c_row][c_col] = self.state[c_row  + 1][c_col]
        elif action == Action.SlideRight: # hint: whats left slides right
            newBoardState[c_row][c_col] = self.state[c_row][c_col - 1]
        elif action == Action.SlideLeft:
            newBoardState[c_row][c_col] = self.state[c_row][c_col + 1]
        
    def get_possible_actions(self):
        if cell_exists(self.state, self.c_row - 1, self.c_col):
            # check if a cell exist directly above this one
            yield Action.SlideDown
        if cell_exists(self.state, self.c_row + 1, self.c_col):
            # check if a cell exist directly below this one
            yield  Action.SlideUp
        if cell_exists(self.state, self.c_row, self.c_col - 1):
            # if cell exists to the left
            yield Action.SlideRight
        if cell_exists(self.state, self.c_row, self.c_col + 1):
            # if cell exists to the right
            yield Action.SlideLeft
    
    def find_empty_cell(self):
        for i, _ in enumerate(self.state):
            for j, item in enumerate(self.state[i]):
                if item == 0:
                    return i, j
                
    def __eq__(self, nueron):
        return self.state == nueron.state


class Action(enum.Enum):
    SlideUp = 0
    SlideDown = 1
    SlideRight = 2
    SlideLeft = 3


class Frontier:
    s = []
    explored_nuerons = []
        
    def add(self, *nuerons):
        for nueron in nuerons:
            self._add_setwise(nueron, self.s)
            self._add_setwise(nueron, self.explored_nuerons)
    
    def _add_setwise(self, nueron, array):
        for i in array:
            if nueron == i:
                return
        array.append(nueron)
    
    def pop(self):
         pass
         
    def empty(self):
         return len(self.s) == 0


class StackFrontier(Frontier):
    # frontier for Dept first search
    def pop(self):
         return self.s.pop()


class QueueFrontier(Frontier):
    # frontier for Shallow first search
    def pop(self):
         return self.s.pop(0)
         

class Solution:
    def __init__(self, initial_nueron, goal_nueron):
        self.goal_nueron = goal_nueron
        self.initial_nueron = initial_nueron
    
    def resolve(self):
        # resolve the solution path into an array
        steps = []    # steps to take to solve problem
        nueron = self.goal_nueron
        while True:
            if nueron == initial_nueron:
                return steps
            steps.insert(0, nueron)
            nueron = nueron.parent





b  = [
    [0,2,3],
    [4,5,6],
    [7,8,1]
]

n = Nueron(b)
a = n.get_possible_actions()
print(list(a))