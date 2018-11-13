<?php

namespace App\Command\BusStopGroup;

use App\Command\CommandHandlerInterface;
use App\Entity\BusStopGroup;
use Doctrine\ORM\EntityManagerInterface;

final class CreateBusStopGroupCommandHandler implements CommandHandlerInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(CreateBusStopGroupCommand $command): void
    {
        $busStopGroup = new BusStopGroup($command->id(), $command->name());
        $this->entityManager->persist($busStopGroup);
        $this->entityManager->flush();
    }
}