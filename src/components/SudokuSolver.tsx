import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

// Helper to create a 9x9 grid
const defaultGrid = [
    ['5', '3', '', '', '7', '', '', '', ''],
    ['6', '', '', '1', '9', '5', '', '', ''],
    ['', '9', '8', '', '', '', '', '6', ''],
    ['8', '', '', '', '6', '', '', '', '3'],
    ['4', '', '', '8', '', '3', '', '', '1'],
    ['7', '', '', '', '2', '', '', '', '6'],
    ['', '6', '', '', '', '', '2', '8', ''],
    ['', '', '', '4', '1', '9', '', '', '5'],
    ['', '', '', '', '8', '', '', '7', '9'],
];


function isValidSudoku(grid: string[][]): boolean {
    // Check rows, columns, and 3x3 boxes for duplicates (ignoring empty cells)
    for (let i = 0; i < 9; i++) {
        const row = new Set();
        const col = new Set();
        for (let j = 0; j < 9; j++) {
            // Row
            if (grid[i][j] && row.has(grid[i][j])) return false;
            if (grid[i][j]) row.add(grid[i][j]);
            // Column
            if (grid[j][i] && col.has(grid[j][i])) return false;
            if (grid[j][i]) col.add(grid[j][i]);
        }
    }
    // 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const box = new Set();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const val = grid[boxRow * 3 + i][boxCol * 3 + j];
                    if (val && box.has(val)) return false;
                    if (val) box.add(val);
                }
            }
        }
    }
    return true;
}

function solveSudoku(grid: string[][]): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (!grid[row][col]) {
                for (let num = 1; num <= 9; num++) {
                    grid[row][col] = num.toString();
                    if (isValidSudoku(grid) && solveSudoku(grid)) return true;
                    grid[row][col] = '';
                }
                return false;
            }
        }
    }
    return true;
}

const SudokuSolver: React.FC = () => {
    const [grid, setGrid] = useState<string[][]>(defaultGrid.map(row => [...row]));
    const [message, setMessage] = useState<string>('');
    const [explanation, setExplanation] = useState<string>('');

    const handleChange = (row: number, col: number, value: string) => {
        if (/^$|^[1-9]$/.test(value)) {
            const newGrid = grid.map((r, i) =>
                r.map((cell, j) => (i === row && j === col ? value : cell))
            );
            setGrid(newGrid);
        }
    };

    const handleEvaluate = () => {
        setMessage(isValidSudoku(grid) ? 'Valid Sudoku state.' : 'Invalid Sudoku state!');
    };

    const handleSolve = () => {
        const copy = grid.map(row => row.slice());
        if (!isValidSudoku(copy)) {
            setMessage('Cannot solve: current state is invalid!');
            return;
        }
        if (solveSudoku(copy)) {
            setGrid(copy);
            setMessage('Solved!');
        } else {
            setMessage('No solution exists.');
        }
    };

    const handleSolveNextCell = () => {
        const copy = grid.map(row => row.slice());
        let found = false;
        let explain = '';
        for (let row = 0; row < 9 && !found; row++) {
            for (let col = 0; col < 9 && !found; col++) {
                if (!copy[row][col]) {
                    for (let num = 1; num <= 9; num++) {
                        copy[row][col] = num.toString();
						const copyToSolve = copy.map(row => row.slice());
                        if (isValidSudoku(copyToSolve) && solveSudoku(copyToSolve)) {
                            setGrid(copy);
                            explain = `Filled cell [${row + 1}, ${col + 1}] with ${num}. This is the smallest valid number for this cell.`;
                            setExplanation(explain);
                            found = true;
                            break;
                        }
                        copy[row][col] = '';
                    }
                    if (!found) {
                        explain = `No valid number can be placed at cell [${row + 1}, ${col + 1}].`;
                        setExplanation(explain);
                    }
                }
            }
        }
        if (!found && !explain) {
            setExplanation('All cells are filled or no valid moves remain.');
        }
    };

    const handleReset = () => {
        setGrid(defaultGrid.map(row => [...row]));
        setMessage('');
    };

    return (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>Sudoku Solver</Typography>
            <Grid container spacing={0.5} sx={{ width: 'max-content', mb: 2, flexDirection: 'column' }}>
                {grid.map((row, i) => (
                    <Grid container key={i}>
                        {row.map((cell, j) => (
                            <Grid
                                key={`${i}-${j}`}
                                sx={{
                                    border: '1px solid #ccc',
                                    width: 40, height: 40,
                                    background: (i % 3 === 2 && i !== 8) || (j % 3 === 2 && j !== 8) ? '#e0e0e0' : 'white',
                                }}
                            >
                                <TextField
                                    value={cell}
                                    onChange={e => handleChange(i, j, e.target.value.replace(/[^1-9]/g, ''))}
                                    inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: 20, padding: 0 } }}
                                    variant="standard"
                                    sx={{ width: 1, height: 1 }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button variant="contained" color="primary" onClick={handleEvaluate}>Evaluate</Button>
                <Button variant="contained" color="secondary" onClick={handleSolve}>Solve</Button>
                <Button variant="outlined" onClick={handleReset}>Reset</Button>
                <Button variant="contained" color="success" onClick={handleSolveNextCell}>Solve Next Cell</Button>
            </Box>
            {explanation && (
                <Typography color="info.main" sx={{ mb: 2 }}>{explanation}</Typography>
            )}
            <Typography color={message.includes('Invalid') ? 'error' : 'primary'}>{message}</Typography>
        </Box>
    );
};

export default SudokuSolver;
