import {Dispatch} from 'redux'
import {authAPI, LoginParamsType} from "../../api/todolists-api";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {ClearDataActionType, clearTodosDataAC} from "../TodolistsList/todolists-reducer";
import {setAppErrorAC, setAppStatusAC} from "../../app/app-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState = {
    isLoggedIn: false
}
const slice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value
        }
    }
})
export const authReducer = slice.reducer
// const setIsLoggedInAC = slice.actions.setIsLoggedInAC или деструктуризацией:
export const {setIsLoggedInAC} = slice.actions


// thunks
export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status:'loading'}))
    authAPI.login(data).then((res) => {
        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC({status:'succeeded'}))
            dispatch(setIsLoggedInAC({value: true}))
        } else {
            handleServerAppError(res.data, dispatch)
        }
    })
        .catch((err) => handleServerNetworkError(err.message, dispatch))
}

export const logoutTC = () => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status:'loading'}))
    authAPI.logout().then((res) => {
        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC({status:'succeeded'}))
            dispatch(setIsLoggedInAC({value: false}))
            dispatch(clearTodosDataAC())
        } else {
            handleServerAppError(res.data, dispatch)
        }
    })
        .catch((err) => handleServerNetworkError(err.message, dispatch))
}

// types
/*
export type InitialStateType = typeof initialState

export type SetAppErrorACType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusACType = ReturnType<typeof setAppStatusAC>
type ActionsType = setIsLoggedInACType | SetAppStatusACType | SetAppErrorACType | ClearDataActionType*/
export type setIsLoggedInACType = ReturnType<typeof setIsLoggedInAC>