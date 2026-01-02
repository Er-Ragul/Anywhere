#!/bin/bash

wg set wg0 peer $Public_key remove
echo "Peer removed"