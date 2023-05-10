import React from 'react'
import { Message, MessageText, Button, Row, Text } from '@pancakeswap/uikit'

const StepFour = (props) => {
  const { isLoading, isRejected, setGoSteps, setIsRejected } = props
  return (
    <>
      <style jsx global>
        {`
          .step-four-item {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .step-four-item .content {
            display: flex;
            justify-content: center;
            margin: 0 10px;
          }
          .step-four-item .footer {
            display: flex;
            justify-content: flex-end;
            margin-top: auto;
          }
          .text-label {
            margin-bottom: 5px;
          }
        `}
      </style>
      <section className="step-four-item">
        <Row className="row content">
          {isLoading && (
            // @ts-ignore
            <Message variant="warning" style={{ width: '98%' }}>
              <MessageText>loading</MessageText>
            </Message>
          )}
          {isRejected && (
            // @ts-ignore
            <Message variant="danger" style={{ width: '98%' }}>
              <MessageText>User Denied Transaction</MessageText>
            </Message>
          )}
          {!isLoading && !isRejected && (
            // @ts-ignore
            <Message variant="success" style={{ width: '98%' }}>
              <MessageText>The pool is created successfully.</MessageText>
            </Message>
          )}
        </Row>
        <span style={{ textAlign: 'left' }}>
          <Text fontSize={20} bold style={{ paddingLeft: '20px' }}>
            You need to confirm 2 transactions
          </Text>
          <br />
          <Text fontSize={14} bold style={{ paddingLeft: '40px' }}>
            1.  Confirm the approval for reward token,
            when creating the pool,
            the reward token should be transfered from your wallet to the pool.
          </Text>
          <br />
          <Text fontSize={14} bold style={{ paddingLeft: '40px' }}>
            2.  Confirm the transaction of creating pool.
          </Text>
        </span>
        <div className="footer">
          <Button
            mr="8px"
            type="button"
            variant="light"
            onClick={() => {
              setGoSteps(2)
              setIsRejected(false)
            }}
          >
            Prev
          </Button>
          {/* <Button type="button" variant="success" onClick={() => setGoSteps(4)}>Submit</Button> */}
        </div>
      </section>
    </>
  )
}

export default StepFour
